import { describe, it, expect } from "vitest";
import { parseCuratorResponse, buildPrompt } from "@/ingestion/curator";

const valid = JSON.stringify({
  verdicts: [
    { index: 0, score: 8, clickbait: false, reason: "Direct AAPL earnings impact", section: "equities" },
    { index: 1, score: 2, clickbait: true, reason: "Listicle bait", section: "tech" },
  ],
});

describe("parseCuratorResponse", () => {
  it("parses valid verdicts", () => {
    const v = parseCuratorResponse(valid, 2);
    expect(v).toHaveLength(2);
    expect(v[0].score).toBe(8);
  });

  it("throws on malformed JSON", () => {
    expect(() => parseCuratorResponse("not json", 2)).toThrow();
  });

  it("throws when a verdict index is out of range", () => {
    expect(() => parseCuratorResponse(valid, 1)).toThrow();
  });

  it("throws on score out of range (11)", () => {
    const bad = JSON.stringify({
      verdicts: [{ index: 0, score: 11, clickbait: false, reason: "x", section: "tech" }],
    });
    expect(() => parseCuratorResponse(bad, 1)).toThrow();
  });

  it("throws on non-enum section", () => {
    const bad = JSON.stringify({
      verdicts: [{ index: 0, score: 5, clickbait: false, reason: "x", section: "opera" }],
    });
    expect(() => parseCuratorResponse(bad, 1)).toThrow();
  });

  it("throws on duplicate verdict indices", () => {
    const bad = JSON.stringify({
      verdicts: [
        { index: 0, score: 5, clickbait: false, reason: "a", section: "tech" },
        { index: 0, score: 7, clickbait: false, reason: "b", section: "tech" },
      ],
    });
    expect(() => parseCuratorResponse(bad, 2)).toThrow(/duplicate/);
  });

  it("tolerates missing indices (partial verdicts allowed)", () => {
    const partial = JSON.stringify({
      verdicts: [{ index: 1, score: 5, clickbait: false, reason: "x", section: "tech" }],
    });
    expect(parseCuratorResponse(partial, 3)).toHaveLength(1);
  });
});

describe("buildPrompt", () => {
  it("includes topics and tickers in the profile", () => {
    const p = buildPrompt(
      [{ title: "T", summary: null, source: "S", section: "tech" }],
      { topics: ["AI", "M&A"], tickers: ["AAPL"] },
    );
    expect(p).toContain("AI");
    expect(p).toContain("AAPL");
  });

  it("lists every article with its index prefix", () => {
    const p = buildPrompt(
      [
        { title: "First article", summary: null, source: "SourceA", section: "tech" },
        { title: "Second article", summary: "A summary", source: "SourceB", section: null },
      ],
      { topics: ["AI"], tickers: [] },
    );
    expect(p).toContain("0. [SourceA]");
    expect(p).toContain("First article");
    expect(p).toContain("1. [SourceB]");
    expect(p).toContain("Second article");
  });
});
