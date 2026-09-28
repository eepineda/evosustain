import type { RawArticle } from "./types";

const PRIORITY: Record<RawArticle["sourceType"], number> = { finnhub: 0, rss: 1, hn: 2 };

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function dedupe(batch: RawArticle[], existingUrls: Set<string>): RawArticle[] {
  const fresh = batch.filter((a) => !existingUrls.has(a.url));
  // sort by priority so higher-priority sources claim url/title keys first
  const sorted = [...fresh].sort((a, b) => PRIORITY[a.sourceType] - PRIORITY[b.sourceType]);
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const out: RawArticle[] = [];
  for (const a of sorted) {
    const t = normalizeTitle(a.title);
    if (seenUrls.has(a.url) || seenTitles.has(t)) continue;
    seenUrls.add(a.url);
    seenTitles.add(t);
    out.push(a);
  }
  return out;
}
