import type { RawArticle, Section } from "../types";

interface HnItem {
  id: number;
  title?: string;
  url?: string;
  time?: number; // unix seconds
}

export function filterHnItems(
  items: HnItem[],
  topicRows: { keyword: string; section: Section }[],
): RawArticle[] {
  const out: RawArticle[] = [];
  for (const item of items) {
    if (!item.url || !item.title) continue;
    const title = item.title.toLowerCase();
    const match = topicRows.find((t) => title.includes(t.keyword.toLowerCase()));
    if (!match) continue;
    out.push({
      url: item.url,
      title: item.title,
      summary: null,
      source: "Hacker News",
      sourceType: "hn",
      section: match.section,
      tickerSymbol: null,
      publishedAt: item.time ? new Date(item.time * 1000) : new Date(),
    });
  }
  return out;
}

const HN = "https://hacker-news.firebaseio.com/v0";

export async function fetchHackerNews(
  topicRows: { keyword: string; section: Section }[],
): Promise<RawArticle[]> {
  const res = await fetch(`${HN}/topstories.json`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HN topstories: HTTP ${res.status}`);
  const ids: number[] = (await res.json()).slice(0, 100);
  const items = await Promise.all(
    ids.map(async (id) => {
      // A single flaky item fetch (timeout, DNS, reset) must not sink the batch
      try {
        const r = await fetch(`${HN}/item/${id}.json`, { signal: AbortSignal.timeout(15_000) });
        return r.ok ? ((await r.json()) as HnItem) : null;
      } catch {
        return null;
      }
    }),
  );
  return filterHnItems(items.filter((i): i is HnItem => i !== null), topicRows);
}
