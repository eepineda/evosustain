import { and, desc, eq, gt, gte, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, ingestionRuns, matches, settings, tickers } from "@/db/schema";
import type { Section } from "@/ingestion/types";

export type Article = typeof articles.$inferSelect;
export type Match = typeof matches.$inferSelect;

const SECTIONS: Section[] = ["equities", "finance", "tech", "local", "fitness", "sports"];

// Per-section front-page slots, tuned so the three columns land at similar
// heights: col1 = equities+finance (wide), col2 = tech+fitness, col3 = scoreboard+sports+local
const SECTION_CAPS: Record<Section, number> = {
  equities: 8, finance: 6, tech: 10, local: 6, fitness: 3, sports: 6,
};

export async function getSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return row ?? { id: 1, paperName: "Evoford Journal", scoreThreshold: 5, lastVisitAt: null };
}

export async function touchLastVisit() {
  await db.update(settings).set({ lastVisitAt: new Date() }).where(eq(settings.id, 1));
}

export async function getFrontPage() {
  const s = await getSettings();

  const visible = await db.select().from(articles)
    .where(and(
      ne(articles.status, "dismissed"),
      eq(articles.clickbait, false),
      or(isNull(articles.score), gte(articles.score, s.scoreThreshold)),
    ))
    // No LIMIT: 30-day retention bounds the table (~2k rows), and capping here
    // would undercount newCounts and starve low-volume sections.
    .orderBy(desc(articles.publishedAt));

  const lead = [...visible]
    .filter((a) => a.status === "unread" && a.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;

  const sections = Object.fromEntries(
    SECTIONS.map((sec) => [
      sec,
      visible.filter((a) => a.section === sec && a.id !== lead?.id).slice(0, SECTION_CAPS[sec]),
    ]),
  ) as Record<Section, Article[]>;

  const newCounts = Object.fromEntries(
    SECTIONS.map((sec) => [
      sec,
      visible.filter((a) => a.section === sec && (!s.lastVisitAt || a.fetchedAt > s.lastVisitAt)).length,
    ]),
  ) as Record<Section, number>;

  const tickerRows = await db.select().from(tickers).orderBy(tickers.symbol);
  const [lastRun] = await db.select().from(ingestionRuns)
    .orderBy(desc(ingestionRuns.startedAt)).limit(1);
  const scoreboard = await getScoreboard();

  return { settings: s, lead, sections, newCounts, tickers: tickerRows, lastRun: lastRun ?? null, scoreboard };
}

export interface CompetitionScoreboard {
  competition: string;
  matches: Match[];
}

export async function getScoreboard(): Promise<CompetitionScoreboard[]> {
  const cutoff = new Date(Date.now() - 48 * 3600 * 1000);
  const rows = await db.select().from(matches)
    .where(or(eq(matches.status, "in"), and(eq(matches.status, "post"), gt(matches.startsAt, cutoff))))
    .orderBy(desc(matches.startsAt));

  // Group by competition, preserving the order competitions first appear in
  // (i.e. the competition with the most recent activity leads).
  const order: string[] = [];
  const grouped = new Map<string, Match[]>();
  for (const row of rows) {
    if (!grouped.has(row.competition)) {
      grouped.set(row.competition, []);
      order.push(row.competition);
    }
    grouped.get(row.competition)!.push(row);
  }

  return order.map((competition) => {
    const list = grouped.get(competition)!;
    const live = list.filter((m) => m.status === "in");
    const rest = list.filter((m) => m.status !== "in");
    return { competition, matches: [...live, ...rest].slice(0, 6) };
  });
}

export async function getFilteredToday() {
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
  return db.select().from(articles)
    .where(and(
      gt(articles.fetchedAt, dayAgo),
      or(eq(articles.clickbait, true), sql`${articles.score} < (select score_threshold from settings where id = 1)`),
    ))
    .orderBy(desc(articles.fetchedAt));
}
