import "dotenv/config";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/db";
import { articles, ingestionRuns, tickers, feeds, topics, settings } from "@/db/schema";

vi.mock("@/ingestion/fetchers/finnhub", () => ({
  fetchCompanyNews: vi.fn(async (s: string) => [{
    url: `https://fh.com/${s}`, title: `${s} beats estimates`, summary: null,
    source: "Reuters", sourceType: "finnhub", section: "equities",
    tickerSymbol: s, publishedAt: new Date(),
  }]),
  fetchMarketNews: vi.fn(async () => []),
  fetchQuote: vi.fn(async () => ({ price: 100, dayChangePct: 1.5 })),
}));
vi.mock("@/ingestion/fetchers/rss", () => ({
  fetchRssFeed: vi.fn(async () => { throw new Error("feed down"); }),
}));
vi.mock("@/ingestion/fetchers/hackernews", () => ({
  fetchHackerNews: vi.fn(async () => []),
}));
vi.mock("@/ingestion/scoreboard", () => ({
  refreshScoreboard: vi.fn(async () => {}),
}));
vi.mock("@/ingestion/curator", () => ({
  scoreArticles: vi.fn(async (arts: unknown[]) => ({
    verdicts: arts.map((_, i) => ({ index: i, score: 7, clickbait: false, reason: "relevant", section: "equities" })),
    tokensUsed: 500,
  })),
}));

import { runIngestion } from "@/ingestion/run";

describe("runIngestion", () => {
  beforeEach(async () => {
    await db.delete(articles);
    await db.delete(ingestionRuns);
    await db.delete(tickers);
    await db.delete(feeds);
    await db.delete(topics);
    await db.insert(settings).values({ id: 1 }).onConflictDoNothing();
    await db.insert(tickers).values({ symbol: "AAPL" });
    await db.insert(feeds).values({ name: "F", url: "https://f.com/rss", section: "tech" });
    await db.insert(topics).values({ keyword: "AI", section: "tech" });
  });

  it("saves scored articles and records the run", async () => {
    await runIngestion("full");
    const arts = await db.select().from(articles);
    expect(arts).toHaveLength(1);
    expect(arts[0].score).toBe(7);
    expect(arts[0].tickerSymbol).toBe("AAPL");

    const runs = await db.select().from(ingestionRuns);
    expect(runs).toHaveLength(1);
    expect(runs[0].finishedAt).not.toBeNull();
    expect(runs[0].error).toContain("feed down"); // failing RSS recorded, run still succeeded
  });

  it("updates ticker quotes", async () => {
    await runIngestion("fast");
    const [t] = await db.select().from(tickers);
    expect(t.price).toBe(100);
  });

  it("is idempotent — second run inserts nothing new", async () => {
    await runIngestion("full");
    await runIngestion("full");
    expect(await db.select().from(articles)).toHaveLength(1);
  });

  it("saves articles unscored when the curator fails", async () => {
    const { scoreArticles } = await import("@/ingestion/curator");
    (scoreArticles as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("api down"));
    await runIngestion("full");
    const arts = await db.select().from(articles);
    expect(arts).toHaveLength(1);
    expect(arts[0].score).toBeNull();
  });

  it("skips a run when another is active (DB-backed lock)", async () => {
    // Pre-warm two pool connections first: opening a fresh connection has enough
    // latency that an unwarmed race lets the first call finish its whole pipeline
    // before the second even attempts its insert, masking the overlap we want to test.
    await Promise.all([db.select().from(ingestionRuns), db.select().from(ingestionRuns)]);
    const [first, second] = await Promise.all([runIngestion("fast"), runIngestion("fast")]);
    expect([first, second].filter(Boolean)).toHaveLength(1); // exactly one executed
    expect(await db.select().from(ingestionRuns)).toHaveLength(1);
  });

  it("reaps a stale unfinished run and proceeds", async () => {
    await db.insert(ingestionRuns).values({ startedAt: new Date(Date.now() - 20 * 60 * 1000) });
    const ran = await runIngestion("fast");
    expect(ran).toBe(true);
    const runs = await db.select().from(ingestionRuns);
    expect(runs).toHaveLength(2);
    expect(runs.every((r) => r.finishedAt !== null)).toBe(true);
  });
});
