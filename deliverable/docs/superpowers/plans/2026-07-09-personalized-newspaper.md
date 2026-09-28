# Personalized Newspaper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user news-aggregation web app that polls Finnhub/RSS/HackerNews, scores articles with Claude Haiku, and renders a three-column broadsheet front page from Postgres.

**Architecture:** One Next.js (App Router) server on Railway with an in-process node-cron scheduler. Ingestion is a pure module (`src/ingestion/`) with one entry point `runIngestion()`; pages are server components that only read Postgres via Drizzle. Spec: `docs/superpowers/specs/2026-07-09-personalized-newspaper-design.md` — read it before starting.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind v4, Drizzle ORM + postgres-js, node-cron, Zod, `@anthropic-ai/sdk` (model `claude-haiku-4-5`), `rss-parser`, Vitest.

**Conventions for every task:**
- Run all commands from the repo root: `/Users/barandursun/AI PROJECT/Personalized Newspaper` (quote the path — it contains spaces).
- The Next.js app lives in `app/` (subdirectory) so the repo root keeps `docs/` clean. All file paths below are relative to `app/` unless prefixed with `docs/` or `/`.
- TDD: write the failing test first, watch it fail, implement, watch it pass, commit.
- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

## File Structure (what gets created)

```
app/
  package.json, tsconfig.json, next.config.ts, drizzle.config.ts, vitest.config.ts
  docker-compose.yml            # local Postgres
  .env.example                  # DATABASE_URL, FINNHUB_API_KEY, ANTHROPIC_API_KEY
  src/
    db/
      schema.ts                 # 6 tables + enums
      index.ts                  # drizzle client singleton
      seed.ts                   # starter tickers/feeds/topics/settings row
    ingestion/
      types.ts                  # RawArticle, Section, Fetcher interface
      fetchers/
        rss.ts                  # RSS fetcher (rss-parser)
        hackernews.ts           # HN top stories filtered by topics
        finnhub.ts              # company news per ticker + market news + quotes
      dedupe.ts                 # URL-exact + near-duplicate-title dedupe
      curator.ts                # Claude Haiku batch scoring
      run.ts                    # runIngestion() orchestrator + in-process lock
      retention.ts              # delete old articles
    scheduler.ts                # node-cron wiring (15-min + hourly)
    instrumentation.ts          # Next.js hook that starts the scheduler
    lib/
      queries.ts                # front-page read queries + settings helpers
    app/
      layout.tsx, globals.css
      page.tsx                  # broadsheet front page
      settings/page.tsx         # CRUD tables + audit panel
      api/
        refresh/route.ts        # POST → runIngestion() now
        articles/[id]/route.ts  # PATCH status (read/dismissed)
        tickers/route.ts + tickers/[id]/route.ts
        feeds/route.ts + feeds/[id]/route.ts
        topics/route.ts + topics/[id]/route.ts
        settings/route.ts       # PATCH paperName/scoreThreshold
    components/
      Masthead.tsx, TickerStrip.tsx, SectionBlock.tsx, ArticleItem.tsx
  tests/
    fixtures/                   # recorded API payloads (JSON)
    dedupe.test.ts, curator.test.ts, rss.test.ts, hackernews.test.ts,
    finnhub.test.ts, run.integration.test.ts, queries.test.ts
```

---

### Task 1: Scaffold the Next.js app

**Files:**
- Create: `app/` (via create-next-app), `app/vitest.config.ts`, `app/.env.example`, `app/docker-compose.yml`

- [ ] **Step 1: Scaffold**

```bash
cd "/Users/barandursun/AI PROJECT/Personalized Newspaper"
npx create-next-app@latest app --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*" --use-npm --turbopack
```

Answer any remaining prompts with defaults. This creates `app/src/app/…` structure with Tailwind v4.

- [ ] **Step 2: Install dependencies**

```bash
cd app
npm install drizzle-orm postgres node-cron zod @anthropic-ai/sdk rss-parser
npm install -D drizzle-kit vitest @types/node-cron dotenv
```

- [ ] **Step 3: Create `app/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

Add to `app/package.json` scripts: `"test": "vitest run", "test:watch": "vitest"`.

- [ ] **Step 4: Create `app/docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: newspaper
      POSTGRES_PASSWORD: newspaper
      POSTGRES_DB: newspaper
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

- [ ] **Step 5: Create `app/.env.example`** (copy to `.env` locally; `.env` is gitignored)

```
DATABASE_URL=postgres://newspaper:newspaper@localhost:5433/newspaper
FINNHUB_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

- [ ] **Step 6: Verify it runs**

Run: `docker compose up -d && npm run dev` — expect Next.js welcome page at http://localhost:3000. Stop dev server.

- [ ] **Step 7: Commit**

```bash
cd .. && git add app && git commit -m "Scaffold Next.js app with Tailwind, Drizzle deps, Vitest, local Postgres"
```

---

### Task 2: Database schema, client, and seed

**Files:**
- Create: `app/src/db/schema.ts`, `app/src/db/index.ts`, `app/src/db/seed.ts`, `app/drizzle.config.ts`

- [ ] **Step 1: Write `app/src/db/schema.ts`** (exactly the six tables from the spec)

```ts
import {
  pgTable, pgEnum, serial, integer, real, text, boolean, timestamp,
} from "drizzle-orm/pg-core";

export const sectionEnum = pgEnum("section", [
  "equities", "finance", "tech", "local", "fitness", "fragrance",
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
});

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

export const ingestionRuns = pgTable("ingestion_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  articlesFetched: integer("articles_fetched").notNull().default(0),
  articlesKept: integer("articles_kept").notNull().default(0),
  tokensUsed: integer("tokens_used").notNull().default(0),
  error: text("error"),
});
```

- [ ] **Step 2: Write `app/src/db/index.ts`**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { conn?: postgres.Sql };
const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL!);
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
```

- [ ] **Step 3: Write `app/drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

Add scripts to `package.json`: `"db:push": "drizzle-kit push", "db:seed": "npx tsx src/db/seed.ts"` (also `npm i -D tsx`).

- [ ] **Step 4: Write `app/src/db/seed.ts`** — idempotent (uses `onConflictDoNothing`)

```ts
import "dotenv/config";
import { db } from "./index";
import { settings, tickers, feeds, topics } from "./schema";

async function seed() {
  await db.insert(settings).values({ id: 1 }).onConflictDoNothing();

  await db.insert(tickers).values([
    { symbol: "AAPL" }, { symbol: "MSFT" }, { symbol: "NVDA" },
  ]).onConflictDoNothing();

  await db.insert(feeds).values([
    { name: "CBC Montreal", url: "https://www.cbc.ca/webfeed/rss/rss-canada-montreal", section: "local" },
    { name: "McGill Reporter", url: "https://reporter.mcgill.ca/feed/", section: "local" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", section: "tech" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", section: "tech" },
    { name: "Fragrantica News", url: "https://www.fragrantica.com/rss/news.xml", section: "fragrance" },
    { name: "Stronger by Science", url: "https://www.strongerbyscience.com/feed/", section: "fitness" },
  ]).onConflictDoNothing();

  await db.insert(topics).values([
    { keyword: "M&A", section: "finance" },
    { keyword: "venture capital", section: "finance" },
    { keyword: "macroeconomics", section: "finance" },
    { keyword: "AI", section: "tech" },
    { keyword: "data engineering", section: "tech" },
    { keyword: "Python", section: "tech" },
    { keyword: "Montreal", section: "local" },
    { keyword: "McGill", section: "local" },
    { keyword: "hypertrophy", section: "fitness" },
    { keyword: "niche fragrance", section: "fragrance" },
  ]).onConflictDoNothing();

  console.log("Seeded.");
  process.exit(0);
}
seed();
```

- [ ] **Step 5: Push schema and seed**

Run: `npm run db:push` — expect tables created without error.
Run: `npm run db:seed` — expect "Seeded."
Verify: `docker compose exec db psql -U newspaper -c "select symbol from tickers;"` — expect AAPL/MSFT/NVDA.

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "Add Drizzle schema, db client, and idempotent seed"
```

---

### Task 3: Ingestion types + RSS fetcher

**Files:**
- Create: `app/src/ingestion/types.ts`, `app/src/ingestion/fetchers/rss.ts`
- Test: `app/tests/rss.test.ts`, fixture `app/tests/fixtures/rss-sample.xml`

- [ ] **Step 1: Write `app/src/ingestion/types.ts`**

```ts
export type Section = "equities" | "finance" | "tech" | "local" | "fitness" | "fragrance";
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
```

- [ ] **Step 2: Write the failing test `app/tests/rss.test.ts`**

Create fixture `app/tests/fixtures/rss-sample.xml` — a minimal RSS 2.0 doc with 2 `<item>`s (title, link, description, pubDate). **Important:** omit the channel-level `<link>` element from the fixture — the second test strips the first `<link>` it finds with a non-global regex, and it must hit an item's link, not the channel's.

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { parseRssXml } from "@/ingestion/fetchers/rss";

const xml = readFileSync("tests/fixtures/rss-sample.xml", "utf8");

describe("parseRssXml", () => {
  it("maps items to RawArticle", async () => {
    const articles = await parseRssXml(xml, { name: "Test Feed", section: "tech" });
    expect(articles).toHaveLength(2);
    expect(articles[0]).toMatchObject({
      sourceType: "rss",
      source: "Test Feed",
      section: "tech",
      tickerSymbol: null,
    });
    expect(articles[0].url).toMatch(/^https?:\/\//);
    expect(articles[0].publishedAt).toBeInstanceOf(Date);
  });

  it("skips items without a link", async () => {
    const broken = xml.replace(/<link>.*?<\/link>/, "");
    const articles = await parseRssXml(broken, { name: "Test Feed", section: "tech" });
    expect(articles).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run test — verify it fails**

Run: `npm test` — expect FAIL (`parseRssXml` not found).

- [ ] **Step 4: Implement `app/src/ingestion/fetchers/rss.ts`**

```ts
import Parser from "rss-parser";
import type { RawArticle, Section } from "../types";

const parser = new Parser();

export async function parseRssXml(
  xml: string,
  feed: { name: string; section: Section },
): Promise<RawArticle[]> {
  const parsed = await parser.parseString(xml);
  const out: RawArticle[] = [];
  for (const item of parsed.items) {
    if (!item.link) continue;
    out.push({
      url: item.link,
      title: item.title ?? "(untitled)",
      summary: item.contentSnippet?.slice(0, 500) ?? null,
      source: feed.name,
      sourceType: "rss",
      section: feed.section,
      tickerSymbol: null,
      publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
    });
  }
  return out;
}

export async function fetchRssFeed(
  feed: { name: string; url: string; section: Section },
): Promise<RawArticle[]> {
  const res = await fetch(feed.url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`RSS ${feed.name}: HTTP ${res.status}`);
  return parseRssXml(await res.text(), feed);
}
```

- [ ] **Step 5: Run test — verify pass.** `npm test` → PASS.

- [ ] **Step 6: Commit** — `git add . && git commit -m "Add ingestion types and RSS fetcher with fixture tests"`

---

### Task 4: HackerNews fetcher

**Files:**
- Create: `app/src/ingestion/fetchers/hackernews.ts`
- Test: `app/tests/hackernews.test.ts`, fixture `app/tests/fixtures/hn-items.json`

HN API: `https://hacker-news.firebaseio.com/v0/topstories.json` → array of IDs; `/v0/item/{id}.json` → `{id, title, url, time, score, type}`. Keep stories whose title matches any enabled topic keyword (case-insensitive substring); section = matching topic's section.

- [ ] **Step 1: Write failing test `app/tests/hackernews.test.ts`**

Fixture `hn-items.json`: array of 4 HN item objects — one titled "New AI model beats benchmarks" (matches "AI"), one "Show HN: SQL formatter in Python" (matches "Python"), one "My blog about gardening" (no match), one with no `url` field (self-post → skip).

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { filterHnItems } from "@/ingestion/fetchers/hackernews";

const items = JSON.parse(readFileSync("tests/fixtures/hn-items.json", "utf8"));
const topicRows = [
  { keyword: "AI", section: "tech" as const },
  { keyword: "Python", section: "tech" as const },
];

describe("filterHnItems", () => {
  it("keeps only items matching a topic keyword and having a url", () => {
    const articles = filterHnItems(items, topicRows);
    expect(articles).toHaveLength(2);
    expect(articles.every((a) => a.sourceType === "hn")).toBe(true);
    expect(articles.every((a) => a.section === "tech")).toBe(true);
  });

  it("matches keywords case-insensitively", () => {
    const articles = filterHnItems(
      [{ id: 1, title: "the future of ai agents", url: "https://x.com/a", time: 1720500000 }],
      topicRows,
    );
    expect(articles).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run — FAIL.** Then implement `app/src/ingestion/fetchers/hackernews.ts`:

```ts
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
      const r = await fetch(`${HN}/item/${id}.json`, { signal: AbortSignal.timeout(15_000) });
      return r.ok ? ((await r.json()) as HnItem) : null;
    }),
  );
  return filterHnItems(items.filter((i): i is HnItem => i !== null), topicRows);
}
```

- [ ] **Step 3: Run — PASS. Commit:** `git add . && git commit -m "Add HackerNews fetcher with topic filtering"`

---

### Task 5: Finnhub fetcher (company news, market news, quotes)

**Files:**
- Create: `app/src/ingestion/fetchers/finnhub.ts`
- Test: `app/tests/finnhub.test.ts`, fixtures `app/tests/fixtures/finnhub-company-news.json`, `app/tests/fixtures/finnhub-market-news.json`

Finnhub endpoints (all `https://finnhub.io/api/v1`, `?token=KEY`):
- `/company-news?symbol=AAPL&from=YYYY-MM-DD&to=YYYY-MM-DD` → `[{category, datetime, headline, id, image, related, source, summary, url}]`
- `/news?category=general` → same shape (market/econ news)
- `/quote?symbol=AAPL` → `{c: current, dp: percent change, ...}`

- [ ] **Step 1: Write failing test `app/tests/finnhub.test.ts`**

Fixtures: `finnhub-company-news.json` = 2 realistic company-news objects; `finnhub-market-news.json` = 2 general-news objects.

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { mapCompanyNews, mapMarketNews } from "@/ingestion/fetchers/finnhub";

const company = JSON.parse(readFileSync("tests/fixtures/finnhub-company-news.json", "utf8"));
const market = JSON.parse(readFileSync("tests/fixtures/finnhub-market-news.json", "utf8"));

describe("finnhub mappers", () => {
  it("maps company news with ticker and equities section", () => {
    const arts = mapCompanyNews(company, "AAPL");
    expect(arts).toHaveLength(2);
    expect(arts[0]).toMatchObject({ sourceType: "finnhub", section: "equities", tickerSymbol: "AAPL" });
  });

  it("maps market news to finance section with no ticker", () => {
    const arts = mapMarketNews(market);
    expect(arts[0]).toMatchObject({ section: "finance", tickerSymbol: null });
  });

  it("skips entries without url", () => {
    expect(mapCompanyNews([{ ...company[0], url: "" }], "AAPL")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run — FAIL. Implement `app/src/ingestion/fetchers/finnhub.ts`:**

```ts
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
```

- [ ] **Step 3: Run — PASS. Commit:** `git add . && git commit -m "Add Finnhub fetcher: company news, market news, quotes"`

---

### Task 6: Dedupe

**Files:**
- Create: `app/src/ingestion/dedupe.ts`
- Test: `app/tests/dedupe.test.ts`

Two stages: (1) drop articles whose URL is in `existingUrls`; (2) within the batch, drop near-duplicate titles (normalized: lowercase, strip non-alphanumerics) keeping priority order finnhub > rss > hn.

- [ ] **Step 1: Write failing test `app/tests/dedupe.test.ts`**

```ts
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
});
```

- [ ] **Step 2: Run — FAIL. Implement `app/src/ingestion/dedupe.ts`:**

```ts
import type { RawArticle } from "./types";

const PRIORITY: Record<RawArticle["sourceType"], number> = { finnhub: 0, rss: 1, hn: 2 };

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function dedupe(batch: RawArticle[], existingUrls: Set<string>): RawArticle[] {
  const fresh = batch.filter((a) => !existingUrls.has(a.url));
  // sort by priority so higher-priority sources claim url/title keys first
  const sorted = [...fresh].sort((a, b) => PRIORITY[a.sourceType] - PRIORITY[b.sourceType]);
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const out: RawArticle[] = [];
  for (const a of sorted) {
    const t = normalizeTitle(a.title);
    if (seenUrls.has(a.url) || seenTitles.has(t)) continue;
    seenUrls.add(a.url);
    seenTitles.add(t);
    out.push(a);
  }
  return out;
}
```

- [ ] **Step 3: Run — PASS. Commit:** `git add . && git commit -m "Add two-stage dedupe with source priority"`

---

### Task 7: Curator (Claude Haiku batch scoring)

**Files:**
- Create: `app/src/ingestion/curator.ts`
- Test: `app/tests/curator.test.ts`

Design: one `messages.create` call on `claude-haiku-4-5` with structured outputs (`output_config.format`, JSON schema). Input: interest profile (topics + tickers) and the batch (index, title, summary, source, section-or-null). Output per article: `index`, `score` 0–10, `clickbait` bool, `reason` (≤120 chars), `section`. Zod-validate; on any failure throw — caller saves articles unscored.

- [ ] **Step 1: Write failing test `app/tests/curator.test.ts`** (test parsing/validation, not the API)

```ts
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
});
```

- [ ] **Step 2: Run — FAIL. Implement `app/src/ingestion/curator.ts`:**

```ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { RawArticle } from "./types";

const Verdict = z.object({
  index: z.number().int().min(0),
  score: z.number().int().min(0).max(10),
  clickbait: z.boolean(),
  reason: z.string().max(200),
  section: z.enum(["equities", "finance", "tech", "local", "fitness", "fragrance"]),
});
const Response = z.object({ verdicts: z.array(Verdict) });
export type CuratorVerdict = z.infer<typeof Verdict>;

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          score: { type: "integer" },
          clickbait: { type: "boolean" },
          reason: { type: "string" },
          section: { type: "string", enum: ["equities", "finance", "tech", "local", "fitness", "fragrance"] },
        },
        required: ["index", "score", "clickbait", "reason", "section"],
        additionalProperties: false,
      },
    },
  },
  required: ["verdicts"],
  additionalProperties: false,
};

export function buildPrompt(
  articles: Pick<RawArticle, "title" | "summary" | "source" | "section">[],
  profile: { topics: string[]; tickers: string[] },
): string {
  const list = articles
    .map((a, i) => `${i}. [${a.source}]${a.section ? ` (${a.section})` : ""} ${a.title}${a.summary ? ` — ${a.summary}` : ""}`)
    .join("\n");
  return [
    "You curate a personal newspaper. Score each article for this reader.",
    `Reader interests: ${profile.topics.join(", ")}.`,
    `Portfolio tickers: ${profile.tickers.join(", ")}.`,
    "",
    "For each article return: index; score 0-10 (10 = must-read for this reader, 0 = irrelevant);",
    "clickbait=true when the headline is sensationalist, a listicle, or substance-free;",
    "reason (one short line, max 120 chars); section (keep the given section unless clearly wrong;",
    "if none given, assign the best fit).",
    "",
    "Articles:",
    list,
  ].join("\n");
}

export function parseCuratorResponse(text: string, batchSize: number): CuratorVerdict[] {
  const parsed = Response.parse(JSON.parse(text));
  for (const v of parsed.verdicts) {
    if (v.index >= batchSize) throw new Error(`Curator verdict index ${v.index} out of range`);
  }
  return parsed.verdicts;
}

export async function scoreArticles(
  articles: RawArticle[],
  profile: { topics: string[]; tickers: string[] },
): Promise<{ verdicts: CuratorVerdict[]; tokensUsed: number }> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8000,
    output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(articles, profile) }],
  });
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Curator returned no text block");
  return {
    verdicts: parseCuratorResponse(text.text, articles.length),
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
```

- [ ] **Step 3: Run — PASS. Commit:** `git add . && git commit -m "Add Haiku curator with structured output and Zod validation"`

---

### Task 8: runIngestion orchestrator + retention

**Files:**
- Create: `app/src/ingestion/run.ts`, `app/src/ingestion/retention.ts`
- Test: `app/tests/run.integration.test.ts`

`runIngestion(mode)`: mode `"fast"` = Finnhub only (15-min tick); `"full"` = all sources (hourly tick + refresh button). Steps: acquire in-process lock → create `ingestionRuns` row → fetch each source in its own try/catch (collect per-source errors) → refresh quotes (fast+full) → dedupe against DB urls → score new articles with curator (on curator failure, keep `score=null`) → insert → also rescore existing `score IS NULL` articles (max 30) → update run row (counts, tokensUsed, joined errors or null) → release lock. Retention (full mode only): delete articles older than 30 days, dismissed older than 7 days.

- [ ] **Step 1: Write failing integration test `app/tests/run.integration.test.ts`**

Uses the real local Postgres (`DATABASE_URL` from `.env`), mocks all fetchers and the curator via `vi.mock`. Load env in the test with `import "dotenv/config"`.

```ts
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
});
```

- [ ] **Step 2: Run — FAIL. Implement `app/src/ingestion/retention.ts`:**

```ts
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export async function pruneOldArticles(): Promise<void> {
  const now = Date.now();
  await db.delete(articles).where(lt(articles.fetchedAt, new Date(now - 30 * 24 * 3600 * 1000)));
  await db.delete(articles).where(
    and(eq(articles.status, "dismissed"), lt(articles.fetchedAt, new Date(now - 7 * 24 * 3600 * 1000))),
  );
}
```

- [ ] **Step 3: Implement `app/src/ingestion/run.ts`:**

```ts
import { createHash } from "crypto";
import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { articles, feeds, ingestionRuns, tickers, topics } from "@/db/schema";
import { dedupe } from "./dedupe";
import { scoreArticles } from "./curator";
import { fetchCompanyNews, fetchMarketNews, fetchQuote } from "./fetchers/finnhub";
import { fetchRssFeed } from "./fetchers/rss";
import { fetchHackerNews } from "./fetchers/hackernews";
import { pruneOldArticles } from "./retention";
import type { RawArticle } from "./types";

export type IngestionMode = "fast" | "full";

let running = false;

export async function runIngestion(mode: IngestionMode): Promise<void> {
  if (running) return; // overlapping runs are skipped, not queued
  running = true;
  let runId: number | null = null;
  const errors: string[] = [];
  let fetched = 0;
  let kept = 0;
  let tokensUsed = 0;

  try {
    // Inside the try so a failed insert still releases the lock in finally
    const [run] = await db.insert(ingestionRuns).values({ startedAt: new Date() }).returning();
    runId = run.id;
    const tickerRows = await db.select().from(tickers);
    const topicRows = (await db.select().from(topics)).filter((t) => t.enabled);
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

    // RSS + HN — full mode only
    if (mode === "full") {
      const feedRows = (await db.select().from(feeds)).filter((f) => f.enabled);
      for (const f of feedRows) {
        await collect(`rss:${f.name}`, () => fetchRssFeed(f));
      }
      await collect("hn", () => fetchHackerNews(topicRows));
    }

    fetched = batch.length;

    // Dedupe against DB + within batch
    const existing = await db.select({ url: articles.url }).from(articles);
    const fresh = dedupe(batch, new Set(existing.map((r) => r.url)));

    // Score
    const profile = {
      topics: topicRows.map((t) => t.keyword),
      tickers: tickerRows.map((t) => t.symbol),
    };
    let verdicts: Awaited<ReturnType<typeof scoreArticles>>["verdicts"] | null = null;
    if (fresh.length > 0) {
      try {
        const result = await scoreArticles(fresh, profile);
        verdicts = result.verdicts;
        tokensUsed += result.tokensUsed;
      } catch (e) {
        errors.push(`curator: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Insert
    for (let i = 0; i < fresh.length; i++) {
      const a = fresh[i];
      const v = verdicts?.find((x) => x.index === i) ?? null;
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
        await db.select().from(articles).where(isNull(articles.score)).limit(60)
      )
        .filter((u) => !freshUrls.has(u.url))
        .slice(0, 30);
      if (unscored.length > 0) {
        try {
          const result = await scoreArticles(
            unscored.map((u) => ({
              url: u.url, title: u.title, summary: u.summary, source: u.source,
              sourceType: u.sourceType, section: u.section, tickerSymbol: u.tickerSymbol,
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
    running = false;
  }
}
```

- [ ] **Step 4: Run — PASS** (`docker compose up -d` first). Fix until green.

- [ ] **Step 5: Commit:** `git add . && git commit -m "Add runIngestion orchestrator with failure isolation and retention"`

---

### Task 9: Scheduler + refresh endpoint

**Files:**
- Create: `app/src/scheduler.ts`, `app/src/instrumentation.ts`, `app/src/app/api/refresh/route.ts`

No unit tests (thin wiring); verified end-to-end in Task 13.

- [ ] **Step 1: `app/src/scheduler.ts`**

```ts
import cron from "node-cron";

export function startScheduler() {
  // Lazy-import so instrumentation doesn't pull the db at build time
  const run = async (mode: "fast" | "full") => {
    const { runIngestion } = await import("./ingestion/run");
    await runIngestion(mode).catch((e) => console.error("[ingestion]", e));
  };

  cron.schedule("*/15 * * * *", () => run("fast"));   // finnhub + quotes
  cron.schedule("5 * * * *", () => run("full"));      // everything, at :05
  console.log("[scheduler] started (fast: */15m, full: hourly)");

  // First run shortly after boot so a fresh deploy has content
  setTimeout(() => run("full"), 10_000);
}
```

- [ ] **Step 2: `app/src/instrumentation.ts`** (Next.js instrumentation hook — runs once per server boot)

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.ENABLE_SCHEDULER !== "false") {
    const { startScheduler } = await import("./scheduler");
    startScheduler();
  }
}
```

Set `ENABLE_SCHEDULER=false` in `.env` during local dev if you don't want background polling. Note: `instrumentation.ts` is enabled by default in Next 15 — no config flag needed.

- [ ] **Step 3: `app/src/app/api/refresh/route.ts`**

```ts
import { NextResponse } from "next/server";
import { runIngestion } from "@/ingestion/run";

export async function POST() {
  await runIngestion("full");
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Smoke test.** With real keys in `.env`: `npm run dev`, then `curl -X POST localhost:3000/api/refresh`. Expect `{"ok":true}` and rows in `articles` (psql check). If no API keys yet, defer to Task 13.

- [ ] **Step 5: Commit:** `git add . && git commit -m "Add cron scheduler, instrumentation hook, and refresh endpoint"`

---

### Task 10: Read-path queries + article/settings API routes

**Files:**
- Create: `app/src/lib/queries.ts`, `app/src/app/api/articles/[id]/route.ts`, `app/src/app/api/settings/route.ts`
- Test: `app/tests/queries.test.ts`

- [ ] **Step 1: Write failing test `app/tests/queries.test.ts`**

```ts
import "dotenv/config";
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db";
import { articles, settings } from "@/db/schema";
import { getFrontPage, touchLastVisit } from "@/lib/queries";

function art(over: Record<string, unknown>) {
  return {
    url: `https://x.com/${Math.random()}`, urlHash: "h", title: "T", source: "S",
    sourceType: "rss" as const, section: "tech" as const,
    publishedAt: new Date(), fetchedAt: new Date(), ...over, // JS-supplied fetchedAt avoids DB/host clock-skew flakes
  };
}

describe("getFrontPage", () => {
  beforeEach(async () => {
    await db.delete(articles);
    await db.insert(settings).values({ id: 1, scoreThreshold: 5 })
      .onConflictDoUpdate({ target: settings.id, set: { scoreThreshold: 5, lastVisitAt: null } });
  });

  it("filters below-threshold, clickbait, and dismissed; keeps unscored", async () => {
    await db.insert(articles).values([
      // absorb-lead takes the lead slot (highest score, different section)
      // so keep-high stays inside sections.tech — the lead is excluded from sections.
      art({ title: "absorb-lead", score: 10, section: "finance" }),
      art({ title: "keep-high", score: 8 }),
      art({ title: "drop-low", score: 3 }),
      art({ title: "drop-clickbait", score: 9, clickbait: true }),
      art({ title: "drop-dismissed", score: 9, status: "dismissed" }),
      art({ title: "keep-unscored", score: null }),
    ]);
    const page = await getFrontPage();
    expect(page.lead?.title).toBe("absorb-lead");
    const titles = page.sections.tech.map((a) => a.title);
    expect(titles).toContain("keep-high");
    expect(titles).toContain("keep-unscored");
    expect(titles).not.toContain("drop-low");
    expect(titles).not.toContain("drop-clickbait");
    expect(titles).not.toContain("drop-dismissed");
  });

  it("computes newCounts against pre-update lastVisitAt", async () => {
    await db.insert(articles).values([art({ title: "new", score: 8 })]);
    const first = await getFrontPage(); // lastVisitAt was null → everything new
    expect(first.newCounts.tech).toBe(1);
    await touchLastVisit();
    const second = await getFrontPage();
    expect(second.newCounts.tech).toBe(0);
  });

  it("picks the highest-scored unread article as lead", async () => {
    await db.insert(articles).values([
      art({ title: "lead", score: 10, section: "finance" }),
      art({ title: "not-lead", score: 6 }),
    ]);
    const page = await getFrontPage();
    expect(page.lead?.title).toBe("lead");
  });
});
```

- [ ] **Step 2: Run — FAIL. Implement `app/src/lib/queries.ts`:**

```ts
import { and, desc, eq, gt, gte, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, ingestionRuns, settings, tickers } from "@/db/schema";
import type { Section } from "@/ingestion/types";

export type Article = typeof articles.$inferSelect;

const SECTIONS: Section[] = ["equities", "finance", "tech", "local", "fitness", "fragrance"];

export async function getSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return row ?? { id: 1, paperName: "The Dursun Dispatch", scoreThreshold: 5, lastVisitAt: null };
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
    .orderBy(desc(articles.publishedAt))
    .limit(200);

  const lead = [...visible]
    .filter((a) => a.status === "unread" && a.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;

  const sections = Object.fromEntries(
    SECTIONS.map((sec) => [
      sec,
      visible.filter((a) => a.section === sec && a.id !== lead?.id).slice(0, 8),
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

  return { settings: s, lead, sections, newCounts, tickers: tickerRows, lastRun: lastRun ?? null };
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
```

- [ ] **Step 3: Run — PASS.**

- [ ] **Step 4: `app/src/app/api/articles/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articles } from "@/db/schema";

const Body = z.object({ status: z.enum(["unread", "read", "dismissed"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = Body.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  await db.update(articles).set({ status: body.data.status }).where(eq(articles.id, Number(id)));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: `app/src/app/api/settings/route.ts`**

```ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { settings } from "@/db/schema";

const Body = z.object({
  paperName: z.string().min(1).max(80).optional(),
  scoreThreshold: z.number().int().min(0).max(10).optional(),
});

export async function PATCH(req: Request) {
  const body = Body.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.message }, { status: 400 });
  if (Object.keys(body.data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }
  await db.update(settings).set(body.data).where(eq(settings.id, 1));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Commit:** `git add . && git commit -m "Add front-page queries and article/settings API routes"`

---

### Task 11: Broadsheet front page UI

**Files:**
- Create: `app/src/components/Masthead.tsx`, `app/src/components/TickerStrip.tsx`, `app/src/components/SectionBlock.tsx`, `app/src/components/ArticleItem.tsx`
- Modify: `app/src/app/page.tsx`, `app/src/app/layout.tsx`, `app/src/app/globals.css`

Design tokens (from the approved mockup): paper `#FCFBF7`, ink `#1a1a1a`, kicker red `#8b0000`, hairline `#ddd`. Fonts via `next/font/google`: **Newsreader** (masthead/headlines), **Source Serif 4** (body), **IBM Plex Mono** (ticker strip/timestamps). Layout: masthead → thick rule → ticker strip → hairline → three columns (`grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr]`): col 1 = lead + Equities; col 2 = Technology + Strategic Finance; col 3 = Montréal & McGill + Fitness Research + Fragrance. No dark mode in v1.

- [ ] **Step 1: `layout.tsx` + `globals.css`** — load the three fonts as CSS variables (`--font-display`, `--font-body`, `--font-mono`); body classes `bg-[#FCFBF7] text-[#1a1a1a]`; remove default Next.js styling. In `globals.css` keep only the Tailwind import plus:

```css
@import "tailwindcss";
@theme {
  --font-display: var(--font-newsreader);
  --font-body: var(--font-source-serif);
  --font-mono: var(--font-plex-mono);
}
body { font-family: var(--font-body), Georgia, serif; }
```

- [ ] **Step 2: `ArticleItem.tsx`** (client component)

```tsx
"use client";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/queries";

export function ArticleItem({ article, lead = false }: { article: Article; lead?: boolean }) {
  const router = useRouter();

  async function setStatus(status: "read" | "dismissed") {
    await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <article className={`group relative ${article.status === "read" ? "opacity-50" : ""}`}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setStatus("read")}
        className="block"
      >
        <h3 className={`font-display font-bold leading-snug hover:underline ${lead ? "text-3xl" : "text-base"}`}>
          {article.title}
        </h3>
        {lead && article.summary && <p className="mt-1 text-sm text-neutral-600">{article.summary}</p>}
        {lead && article.scoreReason && (
          <p className="mt-1 text-sm italic text-neutral-500">{article.scoreReason}</p>
        )}
      </a>
      <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-neutral-500">
        {article.tickerSymbol && <span className="font-bold text-[#8b0000]">{article.tickerSymbol}</span>}
        <span>{article.source}</span>
        {article.score === null && <span className="rounded border px-1">unscored</span>}
        <button
          onClick={() => setStatus("dismissed")}
          aria-label="Dismiss article"
          className="invisible cursor-pointer text-neutral-400 hover:text-[#8b0000] group-hover:visible"
        >
          ×
        </button>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: `SectionBlock.tsx`** (server component) — kicker header with new-count + hairline rules between items:

```tsx
import type { Article } from "@/lib/queries";
import { ArticleItem } from "./ArticleItem";

export function SectionBlock({ title, articles, newCount }: {
  title: string; articles: Article[]; newCount: number;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 border-b border-[#1a1a1a] pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b0000]">
        {title}
        {newCount > 0 && <span className="ml-2 font-mono text-neutral-500">{newCount} new</span>}
      </h2>
      {articles.length === 0 ? (
        <p className="text-sm italic text-neutral-400">Nothing new in {title}.</p>
      ) : (
        <div className="space-y-3 divide-y divide-[#ddd] [&>*+*]:pt-3">
          {articles.map((a) => <ArticleItem key={a.id} article={a} />)}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: `TickerStrip.tsx` and `Masthead.tsx`**

TickerStrip: `font-mono text-xs`, one entry per ticker: `AAPL 227.41 ▲1.2%` — green `▲` when `dayChangePct >= 0`, red `▼` otherwise; skip tickers with null price.

Masthead (client component for the refresh button): centered `font-display text-5xl font-bold` paper name; date line `Thursday, July 9 · Montréal` (`toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })`); right side shows `Updated N min ago` from `lastRun.finishedAt` with `⚠` + `title={lastRun.error}` when error non-null, plus a Refresh button that POSTs `/api/refresh` then `router.refresh()` (disable while pending); link to `/settings`. Thick `border-b-2 border-[#1a1a1a]` under the whole masthead.

- [ ] **Step 5: `page.tsx`**

```tsx
import { getFrontPage, touchLastVisit } from "@/lib/queries";
import { Masthead } from "@/components/Masthead";
import { TickerStrip } from "@/components/TickerStrip";
import { SectionBlock } from "@/components/SectionBlock";
import { ArticleItem } from "@/components/ArticleItem";

export const dynamic = "force-dynamic";

export default async function FrontPage() {
  const page = await getFrontPage(); // computes newCounts against pre-update lastVisitAt
  await touchLastVisit();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Masthead settings={page.settings} lastRun={page.lastRun} />
      <TickerStrip tickers={page.tickers} />
      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:divide-x lg:divide-[#ddd] [&>*+*]:lg:pl-8">
        <div>
          {page.lead && (
            <div className="mb-6 border-b-2 border-[#1a1a1a] pb-4">
              <ArticleItem article={page.lead} lead />
            </div>
          )}
          <SectionBlock title="Equities & Portfolio" articles={page.sections.equities} newCount={page.newCounts.equities} />
        </div>
        <div>
          <SectionBlock title="Technology" articles={page.sections.tech} newCount={page.newCounts.tech} />
          <SectionBlock title="Strategic Finance" articles={page.sections.finance} newCount={page.newCounts.finance} />
        </div>
        <div>
          <SectionBlock title="Montréal & McGill" articles={page.sections.local} newCount={page.newCounts.local} />
          <SectionBlock title="Fitness Research" articles={page.sections.fitness} newCount={page.newCounts.fitness} />
          <SectionBlock title="Fragrance" articles={page.sections.fragrance} newCount={page.newCounts.fragrance} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Verify visually.** Insert a few fake articles via psql (or run a real refresh), `npm run dev`, open http://localhost:3000. Check: three columns on desktop, stacked on narrow window; click marks read (fades); hover × dismisses; empty sections show the italic line. Fix styling until it matches the approved broadsheet mockup.

- [ ] **Step 7: Commit:** `git add . && git commit -m "Add broadsheet front page UI"`

---

### Task 12: Settings page + CRUD routes

**Files:**
- Create: `app/src/app/api/tickers/route.ts`, `app/src/app/api/tickers/[id]/route.ts`, `app/src/app/api/feeds/route.ts`, `app/src/app/api/feeds/[id]/route.ts`, `app/src/app/api/topics/route.ts`, `app/src/app/api/topics/[id]/route.ts`, `app/src/app/settings/page.tsx`, `app/src/components/SettingsClient.tsx`

- [ ] **Step 1: CRUD routes.** Each collection route: `POST` (create, Zod-validated) — all follow this template (shown for tickers):

```ts
// app/src/app/api/tickers/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { tickers } from "@/db/schema";

const Body = z.object({ symbol: z.string().min(1).max(10).transform((s) => s.toUpperCase()) });

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "invalid symbol" }, { status: 400 });
  await db.insert(tickers).values({ symbol: body.data.symbol }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}
```

**Note for all PATCH/POST handlers (Tasks 10 & 12):** parse bodies with `const json = await req.json().catch(() => null)` and return 400 when null — a malformed body should be a 400, not a 500.

`[id]/route.ts`: `DELETE` removes the row by id. Feeds `POST` additionally test-fetches the URL before saving (spec requirement):

```ts
// inside feeds POST, after Zod parse ({ name, url, section }):
try {
  const res = await fetch(body.data.url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (e) {
  return NextResponse.json(
    { error: `Feed unreachable: ${e instanceof Error ? e.message : e}` },
    { status: 422 },
  );
}
```

Feeds/topics `[id]/route.ts` also support `PATCH { enabled: boolean }` to toggle.

- [ ] **Step 2: `settings/page.tsx`** (server component) — loads `getSettings()`, all tickers/feeds/topics, `getFilteredToday()`, and today's run stats (sum of `articlesFetched`/`articlesKept` where `startedAt > midnight`), passes to `SettingsClient`.

- [ ] **Step 3: `SettingsClient.tsx`** (client component), same paper aesthetic:
  - Paper-name text input + score-threshold `range` slider (0–10) → `PATCH /api/settings` on change (debounced or on-blur).
  - Three tables (tickers / feeds / topics): rows with delete button; add-row form at bottom; enabled checkbox for feeds/topics. Inline error display for the feed test-fetch 422.
  - Curation audit panel: "N fetched, M filtered today" + `<details>` list of filtered articles (title, score, reason).
  - After every mutation: `router.refresh()`.

- [ ] **Step 4: Verify.** Add a ticker, add a bogus feed URL (expect inline error), move threshold slider and confirm the front page changes. Delete works.

- [ ] **Step 5: Commit:** `git add . && git commit -m "Add settings page with CRUD tables and curation audit"`

---

### Task 13: Deployment config + end-to-end verification

**Files:**
- Create: `app/railway.json`, `README.md` (repo root)
- Modify: `app/package.json`, `app/next.config.ts`

- [ ] **Step 1: Production config.** In `next.config.ts` set `output: "standalone"`. In `package.json`: `"start": "next start"`, and add `"db:migrate": "drizzle-kit push"` (Railway runs push on deploy — acceptable for a single-user app; swap for generated migrations later if needed).

- [ ] **Step 2: `app/railway.json`**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS", "buildCommand": "npm run build" },
  "deploy": {
    "startCommand": "npm run db:migrate && npm run db:seed && npm run start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

(Seed is idempotent, so running it on every deploy is safe.) **Note:** `db:seed` uses `tsx`, a devDependency — if Nixpacks prunes devDeps, move `tsx` (and `drizzle-kit`) to `dependencies` so the start command works in production.

- [ ] **Step 3: Root `README.md`** — brief: what it is, local dev (`docker compose up -d`, `.env` from `.env.example`, `db:push`, `db:seed`, `dev`), Railway setup (new project → add Postgres → set root directory to `app/` → env vars `DATABASE_URL` (reference the Postgres plugin), `FINNHUB_API_KEY`, `ANTHROPIC_API_KEY`).

- [ ] **Step 4: Full local verification (with real API keys in `.env`):**

1. `npm test` — all green.
2. `npm run build` — no type errors.
3. Reset DB (`npm run db:push && npm run db:seed`), `npm run dev`, `curl -X POST localhost:3000/api/refresh`.
4. Open http://localhost:3000 — real articles in correct sections, quotes in ticker strip, scores present (check psql: `select count(*) from articles where score is not null`).
5. Check `ingestion_runs` row: `finished_at` set, `tokens_used > 0`, error null (or only transient feed errors).
6. Exercise: mark read, dismiss, add ticker, change threshold, refresh button.

- [ ] **Step 5: Commit:** `git add . && git commit -m "Add Railway deployment config and README"`

- [ ] **Step 6: Deploy to Railway** (user does the dashboard steps; guide them): create project, provision Postgres, connect repo or `railway up`, set env vars, set root dir `app/`. Verify the deployed URL shows the paper and that articles appear within ~15 min.

---

## Out of scope (per spec)

Multi-user/auth, save-for-later, NewsAPI, dark mode, push notifications, email digests, full-article extraction, separate worker service.
