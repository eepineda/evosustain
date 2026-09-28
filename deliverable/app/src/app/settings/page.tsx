import { sql } from "drizzle-orm";
import { db } from "@/db";
import { feeds, ingestionRuns, tickers, topics } from "@/db/schema";
import { getFilteredToday, getSettings } from "@/lib/queries";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, tickerRows, feedRows, topicRows, filteredToday] = await Promise.all([
    getSettings(),
    db.select().from(tickers).orderBy(tickers.symbol),
    db.select().from(feeds).orderBy(feeds.name),
    db.select().from(topics).orderBy(topics.section, topics.keyword),
    getFilteredToday(),
  ]);

  const [totals] = await db
    .select({
      fetched: sql<number>`coalesce(sum(${ingestionRuns.articlesFetched}), 0)`,
      kept: sql<number>`coalesce(sum(${ingestionRuns.articlesKept}), 0)`,
    })
    .from(ingestionRuns)
    .where(sql`${ingestionRuns.startedAt} > date_trunc('day', now())`);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <SettingsClient
        settings={settings}
        tickers={tickerRows}
        feeds={feedRows}
        topics={topicRows}
        filteredToday={filteredToday}
        totals={{ fetched: Number(totals?.fetched ?? 0), kept: Number(totals?.kept ?? 0) }}
      />
    </main>
  );
}
