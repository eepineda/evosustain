import {
  pgTable, pgEnum, serial, integer, real, text, boolean, timestamp, unique, uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const sectionEnum = pgEnum("section", [
  // "fragrance" is retired from the app but must stay: Postgres can't drop
  // enum values without a destructive migration, and the dormant value is harmless.
  "equities", "finance", "tech", "local", "fitness", "sports", "fragrance",
]);
export const sourceTypeEnum = pgEnum("source_type", ["finnhub", "rss", "hn"]);
export const statusEnum = pgEnum("article_status", ["unread", "read", "dismissed"]);

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(), // always 1 — single row
  paperName: text("paper_name").notNull().default("The Dursun Dispatch"),
  scoreThreshold: integer("score_threshold").notNull().default(5),
  lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
});

export const tickers = pgTable("tickers", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  price: real("price"),
  dayChangePct: real("day_change_pct"),
  quoteUpdatedAt: timestamp("quote_updated_at", { withTimezone: true }),
});

export const feeds = pgTable("feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  section: sectionEnum("section").notNull(),
  enabled: boolean("enabled").notNull().default(true),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  section: sectionEnum("section").notNull(),
  enabled: boolean("enabled").notNull().default(true),
}, (t) => [unique().on(t.keyword, t.section)]);

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  urlHash: text("url_hash").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  source: text("source").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull(),
  section: sectionEnum("section").notNull(),
  tickerSymbol: text("ticker_symbol"),
  score: integer("score"),
  scoreReason: text("score_reason"),
  clickbait: boolean("clickbait").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  status: statusEnum("status").notNull().default("unread"),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(),
  sport: text("sport").notNull(),          // soccer | basketball | tennis
  competition: text("competition").notNull(), // "World Cup" | "FIBA World Cup" | "Wimbledon" | ...
  home: text("home").notNull(),            // team abbrev or winner player name (tennis)
  away: text("away").notNull(),            // team abbrev or loser player name (tennis)
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  detail: text("detail"),                  // tennis set scores "6-4 7-6 6-2"; null for team sports
  status: text("status").notNull(),        // pre | in | post
  statusDetail: text("status_detail"),     // "FT", "HT", "Scheduled", "Final"...
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ingestionRuns = pgTable("ingestion_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  articlesFetched: integer("articles_fetched").notNull().default(0),
  articlesKept: integer("articles_kept").notNull().default(0),
  tokensUsed: integer("tokens_used").notNull().default(0),
  error: text("error"),
}, (t) => [
  // Expression index: every unfinished row indexes as `true`, unique → max one active run
  uniqueIndex("one_active_ingestion_run")
    .on(sql`(${t.finishedAt} IS NULL)`)
    .where(sql`${t.finishedAt} IS NULL`),
]);
