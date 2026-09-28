import Parser from "rss-parser";
import type { RawArticle, Section } from "../types";

const parser = new Parser();

export async function parseRssXml(
  xml: string,
  feed: { name: string; section: Section },
): Promise<RawArticle[]> {
  const parsed = await parser.parseString(xml);
  const out: RawArticle[] = [];
  // Cap per feed so a huge backfill can't flood a single ingestion run
  for (const item of parsed.items.slice(0, 30)) {
    if (!item.link) continue;
    out.push({
      url: item.link,
      title: item.title ?? "(untitled)",
      summary: item.contentSnippet?.slice(0, 500) ?? null,
      source: feed.name,
      sourceType: "rss",
      section: feed.section,
      tickerSymbol: null,
      publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
    });
  }
  return out;
}

export async function fetchRssFeed(
  feed: { name: string; url: string; section: Section },
): Promise<RawArticle[]> {
  const res = await fetch(feed.url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`RSS ${feed.name}: HTTP ${res.status}`);
  return parseRssXml(await res.text(), feed);
}
