export type Section = "equities" | "finance" | "tech" | "local" | "fitness" | "sports";
export type SourceType = "finnhub" | "rss" | "hn";

export interface RawArticle {
  url: string;
  title: string;
  summary: string | null;
  source: string;        // human-readable, e.g. "TechCrunch"
  sourceType: SourceType;
  section: Section | null; // null → curator assigns
  tickerSymbol: string | null;
  publishedAt: Date;
}
