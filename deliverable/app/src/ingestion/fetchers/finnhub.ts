import type { RawArticle } from "../types";

interface FinnhubNews {
  datetime: number; // unix seconds
  headline: string;
  source: string;
  summary: string;
  url: string;
}

function toArticle(n: FinnhubNews, extra: Pick<RawArticle, "section" | "tickerSymbol">): RawArticle | null {
  if (!n.url || !n.headline) return null;
  return {
    url: n.url,
    title: n.headline,
    summary: n.summary?.slice(0, 500) || null,
    source: n.source || "Finnhub",
    sourceType: "finnhub",
    publishedAt: new Date(n.datetime * 1000),
    ...extra,
  };
}

export function mapCompanyNews(news: FinnhubNews[], symbol: string): RawArticle[] {
  return news
    .map((n) => toArticle(n, { section: "equities", tickerSymbol: symbol }))
    .filter((a): a is RawArticle => a !== null);
}

export function mapMarketNews(news: FinnhubNews[]): RawArticle[] {
  return news
    .map((n) => toArticle(n, { section: "finance", tickerSymbol: null }))
    .filter((a): a is RawArticle => a !== null);
}

const BASE = "https://finnhub.io/api/v1";

async function get<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}token=${process.env.FINNHUB_API_KEY}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Finnhub ${path.split("?")[0]}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchCompanyNews(symbol: string): Promise<RawArticle[]> {
  const to = new Date();
  const from = new Date(Date.now() - 2 * 24 * 3600 * 1000);
  const news = await get<FinnhubNews[]>(
    `/company-news?symbol=${symbol}&from=${dateStr(from)}&to=${dateStr(to)}`,
  );
  return mapCompanyNews(news.slice(0, 20), symbol);
}

export async function fetchMarketNews(): Promise<RawArticle[]> {
  const news = await get<FinnhubNews[]>(`/news?category=general`);
  return mapMarketNews(news.slice(0, 30));
}

export async function fetchQuote(symbol: string): Promise<{ price: number; dayChangePct: number } | null> {
  const q = await get<{ c: number; dp: number | null }>(`/quote?symbol=${symbol}`);
  if (!q.c) return null; // Finnhub returns c=0 for unknown symbols
  return { price: q.c, dayChangePct: q.dp ?? 0 };
}
