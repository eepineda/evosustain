import { createHash } from "crypto";
import { and, eq, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { articles, feeds, ingestionRuns, tickers, topics } from "@/db/schema";
import { dedupe } from "./dedupe";
import { scoreArticles } from "./curator";
import { fetchCompanyNews, fetchMarketNews, fetchQuote } from "./fetchers/finnhub";
import { fetchRssFeed } from "./fetchers/rss";
import { fetchHackerNews } from "./fetchers/hackernews";
import { pruneOldArticles } from "./retention";
import { refreshScoreboard } from "./scoreboard";
import type { RawArticle } from "./types";

export type IngestionMode = "fast" | "full";

export async function runIngestion(mode: IngestionMode): Promise<boolean> {
  // Reap stale unfinished runs (crashed process) so the active-run guard can't wedge
  await db.update(ingestionRuns)
    .set({ finishedAt: new Date(), error: "stale run reaped" })
    .where(and(isNull(ingestionRuns.finishedAt), lt(ingestionRuns.startedAt, new Date(Date.now() - 15 * 60 * 1000))));

  // The unique partial index guarantees at most one unfinished run — losing the
  // race means another run is in flight, so skip rather than queue.
  const claimed = await db.insert(ingestionRuns)
    .values({ startedAt: new Date() })
    .onConflictDoNothing()
    .returning();
  if (claimed.length === 0) return false;

  let runId: number | null = null;
  const errors: string[] = [];
  let fetched = 0;
  let kept = 0;
  let tokensUsed = 0;

  try {
    runId = claimed[0].id;
    const tickerRows = await db.select().from(tickers);
    // Narrow away the retired "fragrance" enum value still present in the DB type
    const topicRows = (await db.select().from(topics))
      .filter((t) => t.enabled && t.section !== "fragrance")
      .map((t) => ({ ...t, section: t.section as Exclude<typeof t.section, "fragrance"> }));
    const batch: RawArticle[] = [];

    const collect = async (label: string, fn: () => Promise<RawArticle[]>) => {
      try {
        batch.push(...(await fn()));
      } catch (e) {
        errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    // Finnhub — both modes
    for (const t of tickerRows) {
      await collect(`finnhub:${t.symbol}`, () => fetchCompanyNews(t.symbol));
    }
    await collect("finnhub:market", fetchMarketNews);

    // Quotes — both modes
    for (const t of tickerRows) {
      try {
        const q = await fetchQuote(t.symbol);
        if (q) {
          await db.update(tickers)
            .set({ price: q.price, dayChangePct: q.dayChangePct, quoteUpdatedAt: new Date() })
            .where(eq(tickers.id, t.id));
        }
      } catch (e) {
        errors.push(`quote:${t.symbol}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Live scoreboard — both modes (cheap, and users want fresh scores)
    try {
      await refreshScoreboard();
    } catch (e) {
      errors.push(`scores: ${e instanceof Error ? e.message : String(e)}`);
    }

    // RSS + HN — full mode only
    if (mode === "full") {
      const feedRows = (await db.select().from(feeds))
        .filter((f) => f.enabled && f.section !== "fragrance")
        .map((f) => ({ ...f, section: f.section as Exclude<typeof f.section, "fragrance"> }));
      for (const f of feedRows) {
        await collect(`rss:${f.name}`, () => fetchRssFeed(f));
      }
      await collect("hn", () => fetchHackerNews(topicRows));
    }

    fetched = batch.length;

    // Dedupe against DB + within batch
    const existing = await db.select({ url: articles.url }).from(articles);
    const fresh = dedupe(batch, new Set(existing.map((r) => r.url)));

    // Score in chunks — a large first run in one call would overflow the
    // curator's max_tokens, truncating the JSON and un-scoring everything.
    const profile = {
      topics: topicRows.map((t) => t.keyword),
      tickers: tickerRows.map((t) => t.symbol),
    };
    const CURATOR_BATCH = 30;
    const verdictByIndex = new Map<number, Awaited<ReturnType<typeof scoreArticles>>["verdicts"][number]>();
    for (let start = 0; start < fresh.length; start += CURATOR_BATCH) {
      const chunk = fresh.slice(start, start + CURATOR_BATCH);
      try {
        const result = await scoreArticles(chunk, profile);
        tokensUsed += result.tokensUsed;
        for (const v of result.verdicts) verdictByIndex.set(start + v.index, v);
      } catch (e) {
        errors.push(`curator[${start}]: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Insert
    for (let i = 0; i < fresh.length; i++) {
      const a = fresh[i];
      const v = verdictByIndex.get(i) ?? null;
      const inserted = await db.insert(articles).values({
        url: a.url,
        urlHash: createHash("sha256").update(a.url).digest("hex"),
        title: a.title,
        summary: a.summary,
        source: a.source,
        sourceType: a.sourceType,
        section: v?.section ?? a.section ?? "tech",
        tickerSymbol: a.tickerSymbol,
        score: v?.score ?? null,
        scoreReason: v?.reason ?? null,
        clickbait: v?.clickbait ?? false,
        publishedAt: a.publishedAt,
      }).onConflictDoNothing().returning({ id: articles.id });
      kept += inserted.length;
    }

    // Rescore previously-unscored articles (curator outage recovery).
    // Exclude articles inserted in THIS run — per spec, the *next* run rescores them.
    if (mode === "full") {
      const freshUrls = new Set(fresh.map((a) => a.url));
      const unscored = (
        await db.select().from(articles).where(isNull(articles.score))
          .orderBy(articles.fetchedAt).limit(60)
      )
        .filter((u) => !freshUrls.has(u.url))
        .slice(0, 30);
      if (unscored.length > 0) {
        try {
          const result = await scoreArticles(
            unscored.map((u) => ({
              url: u.url, title: u.title, summary: u.summary, source: u.source,
              sourceType: u.sourceType,
              // legacy fragrance rows get null → the curator assigns a live section
              section: u.section === "fragrance" ? null : u.section,
              tickerSymbol: u.tickerSymbol,
              publishedAt: u.publishedAt,
            })),
            profile,
          );
          tokensUsed += result.tokensUsed;
          for (const v of result.verdicts) {
            const row = unscored[v.index];
            if (!row) continue;
            await db.update(articles)
              .set({ score: v.score, scoreReason: v.reason, clickbait: v.clickbait })
              .where(eq(articles.id, row.id));
          }
        } catch (e) {
          errors.push(`rescore: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      await pruneOldArticles();
    }
    return true;
  } finally {
    if (runId !== null) {
      await db.update(ingestionRuns)
        .set({
          finishedAt: new Date(),
          articlesFetched: fetched,
          articlesKept: kept,
          tokensUsed,
          error: errors.length ? errors.join("; ") : null,
        })
        .where(eq(ingestionRuns.id, runId));
    }
  }
}
