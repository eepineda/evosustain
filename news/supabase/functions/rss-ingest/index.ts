import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { XMLParser } from "npm:fast-xml-parser@4.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://evoford.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const ADMIN_EMAIL = "eepinedacarrasco@gmail.com";
const MAX_SOURCES = 50;
const MAX_ITEMS_PER_SOURCE = 30;
const MAX_FEED_BYTES = 2_000_000;

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (value && typeof value === "object" && "#text" in value) return text((value as Record<string, unknown>)["#text"]);
  return "";
}

function cleanHtml(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
}

function normalizeDate(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeItem(item: Record<string, unknown>) {
  const linkValue = item.link;
  let link = "";
  if (typeof linkValue === "string") link = linkValue;
  else if (Array.isArray(linkValue)) {
    const preferred = linkValue.find((x) => x && typeof x === "object" && ((x as Record<string, unknown>)["@_rel"] === "alternate" || !(x as Record<string, unknown>)["@_rel"]));
    link = text(preferred && typeof preferred === "object" ? (preferred as Record<string, unknown>)["@_href"] : "");
  } else if (linkValue && typeof linkValue === "object") {
    const obj = linkValue as Record<string, unknown>;
    link = text(obj["@_href"] ?? obj["#text"]);
  }

  const title = text(item.title);
  const guid = text(item.guid ?? item.id) || link || title;
  const description = text(item.description ?? item.summary ?? item["content:encoded"] ?? item.content);
  const date = normalizeDate(item.pubDate ?? item.published ?? item.updated ?? item["dc:date"]);
  return {
    title: title.slice(0, 500),
    article_url: link.slice(0, 2000),
    feed_guid: guid.slice(0, 2000),
    summary: cleanHtml(description),
    published_at: date,
    raw_payload: item,
  };
}

function extractItems(parsed: Record<string, unknown>): Record<string, unknown>[] {
  const rss = parsed.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  if (channel) return asArray(channel.item as Record<string, unknown> | Record<string, unknown>[]);
  const feed = parsed.feed as Record<string, unknown> | undefined;
  if (feed) return asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[]);
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return response({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return response({ error: "Server configuration is incomplete." }, 500);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || userData.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return response({ error: "Not authorized." }, 403);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: sources, error: sourceError } = await admin
    .from("rss_sources")
    .select("id,name,feed_url,category,active")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(MAX_SOURCES);

  if (sourceError) return response({ error: sourceError.message }, 500);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    processEntities: true,
    trimValues: true,
    parseTagValue: false,
  });

  const results: Array<{ source: string; imported: number; skipped: number; error?: string }> = [];
  let totalImported = 0;

  for (const source of sources || []) {
    const result = { source: source.name, imported: 0, skipped: 0 } as { source: string; imported: number; skipped: number; error?: string };
    try {
      const feedUrl = new URL(source.feed_url);
      if (!["http:", "https:"].includes(feedUrl.protocol)) throw new Error("Feed URL must use HTTP or HTTPS.");

      const feedResponse = await fetch(feedUrl, {
        headers: { "User-Agent": "EvofordNewsBot/1.0 (+https://evoford.com/news/)", "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
        signal: AbortSignal.timeout(15000),
      });
      if (!feedResponse.ok) throw new Error(`Feed returned HTTP ${feedResponse.status}`);

      const xml = await feedResponse.text();
      if (xml.length > MAX_FEED_BYTES) throw new Error("Feed exceeds the 2 MB safety limit.");
      const parsed = parser.parse(xml) as Record<string, unknown>;
      const items = extractItems(parsed).slice(0, MAX_ITEMS_PER_SOURCE);

      for (const rawItem of items) {
        const item = normalizeItem(rawItem);
        if (!item.title || !item.article_url || !item.feed_guid) {
          result.skipped++;
          continue;
        }
        let articleUrl: URL;
        try { articleUrl = new URL(item.article_url); } catch { result.skipped++; continue; }
        if (!["http:", "https:"].includes(articleUrl.protocol)) { result.skipped++; continue; }

        const { data: existing } = await admin
          .from("imported_items")
          .select("id")
          .eq("source_id", String(source.id))
          .eq("feed_guid", item.feed_guid)
          .maybeSingle();

        if (existing) {
          result.skipped++;
          continue;
        }

        const { error: insertError } = await admin.from("imported_items").insert({
          source_id: String(source.id),
          feed_guid: item.feed_guid,
          title: item.title,
          article_url: item.article_url,
          summary: item.summary,
          published_at: item.published_at,
          raw_payload: item.raw_payload,
          status: "pending",
          imported_at: new Date().toISOString(),
        });

        if (insertError) {
          if (insertError.code === "23505") result.skipped++;
          else throw insertError;
        } else {
          result.imported++;
          totalImported++;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        result.error = error.message;
      } else if (error && typeof error === "object") {
        const e = error as Record<string, unknown>;
        result.error = [e.message, e.details, e.hint, e.code].filter(Boolean).map(String).join(" | ") || JSON.stringify(e);
      } else {
        result.error = String(error);
      }
    }
    results.push(result);
  }

  return response({
    success: true,
    checked_sources: results.length,
    imported: totalImported,
    results,
  });
});
