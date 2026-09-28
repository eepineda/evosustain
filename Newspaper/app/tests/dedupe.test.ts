import { describe, it, expect } from "vitest";
import { dedupe, normalizeTitle } from "@/ingestion/dedupe";
import type { RawArticle } from "@/ingestion/types";

function art(over: Partial<RawArticle>): RawArticle {
  return {
    url: "https://a.com/1", title: "Title", summary: null, source: "S",
    sourceType: "rss", section: "tech", tickerSymbol: null,
    publishedAt: new Date(), ...over,
  };
}

describe("normalizeTitle", () => {
  it("lowercases and strips punctuation/whitespace", () => {
    expect(normalizeTitle("Apple's Q3: Record Profits!")).toBe(normalizeTitle("apples q3 record profits"));
  });
});

describe("dedupe", () => {
  it("drops articles whose url already exists", () => {
    const batch = [art({ url: "https://a.com/old" }), art({ url: "https://a.com/new", title: "Other" })];
    const out = dedupe(batch, new Set(["https://a.com/old"]));
    expect(out).toHaveLength(1);
    expect(out[0].url).toBe("https://a.com/new");
  });

  it("keeps higher-priority source for near-duplicate titles", () => {
    const batch = [
      art({ url: "https://hn.com/x", title: "Fed Holds Rates Steady", sourceType: "hn" }),
      art({ url: "https://fh.com/x", title: "Fed holds rates steady!", sourceType: "finnhub" }),
    ];
    const out = dedupe(batch, new Set());
    expect(out).toHaveLength(1);
    expect(out[0].sourceType).toBe("finnhub");
  });

  it("dedupes identical urls within the batch", () => {
    const batch = [art({}), art({ title: "Different title entirely" })]; // same url
    expect(dedupe(batch, new Set())).toHaveLength(1);
  });

  it("keeps two distinct articles with different urls and titles", () => {
    const batch = [
      art({ url: "https://a.com/1", title: "First Story About Weather" }),
      art({ url: "https://b.com/2", title: "Second Story About Sports" }),
    ];
    const out = dedupe(batch, new Set());
    expect(out).toHaveLength(2);
  });
});
