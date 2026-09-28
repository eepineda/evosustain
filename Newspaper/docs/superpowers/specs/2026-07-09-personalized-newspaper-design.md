# Personalized Newspaper — Design

**Date:** 2026-07-09
**Status:** Approved by user (brainstorming session)

## What this is

A single-user web app that aggregates news into a minimalist digital broadsheet. It fetches from Finnhub, RSS feeds, and HackerNews on a schedule, scores every article for relevance and clickbait with Claude Haiku, stores everything in Postgres, and renders a dense three-column newspaper front page that loads instantly because it only reads from the database.

**User:** one person (the owner). No auth, no multi-user features.
**Deployment:** Railway — one Next.js service + Railway Postgres.

## Decisions made during brainstorming

| Question | Decision |
|---|---|
| Audience | Single user, no auth |
| Hosting | Railway (app + Postgres) |
| LLM curation | Claude Haiku (`claude-haiku-4-5`), batch scoring at ingestion |
| Data sources | Finnhub free tier, RSS feeds, HackerNews API. NewsAPI rejected (24h delay on free tier) |
| Freshness | 15-min polling for Finnhub; hourly for RSS/HN; manual "Refresh now" button |
| V1 features | Ticker CRUD, feed/topic CRUD, read/dismiss tracking. No save-for-later |
| Visual style | Classic broadsheet: warm paper, serif masthead, column rules, red kickers |
| Layout | Dense three-column broadsheet, stacks on mobile |
| Architecture | Single Next.js service with in-process scheduler (approach 1 of 3) |

## Architecture

One Next.js (App Router, TypeScript, Tailwind v4) app running as a long-lived Node server on Railway. Drizzle ORM against Railway Postgres.

```
┌─────────────────────── Next.js server on Railway ───────────────────────┐
│                                                                          │
│  Scheduler (instrumentation.ts, node-cron)                               │
│    every 15 min / hourly ──► Ingestion pipeline (src/ingestion/)         │
│                       1. Fetchers: Finnhub │ RSS │ HackerNews            │
│                       2. Normalize → common RawArticle shape             │
│                       3. Dedupe (URL exact + near-duplicate titles)      │
│                       4. Curator: Claude Haiku batch-scores new articles │
│                       5. Write scored articles ────────────┐             │
│                                                            ▼             │
│  Pages (server components) ◄── read only ──────────── Postgres (Drizzle) │
│    /          three-column broadsheet front page                         │
│    /settings  tickers, feeds, topics CRUD + curation audit               │
│  API routes: read/dismiss toggle, refresh-now, settings mutations        │
└──────────────────────────────────────────────────────────────────────────┘
```

Key properties:

- **Read path never touches external APIs.** The front page is one Postgres query. This is what makes loads instant (PRD US3).
- **Ingestion is a pure module** at `src/ingestion/` with one entry point, `runIngestion()`. The cron scheduler and the "Refresh now" API route both call it. Nothing else imports it, so it can move to a separate worker service later without touching app code.
- **Fetchers are pluggable:** each source is one file implementing `fetch(): Promise<RawArticle[]>`. A new source = one new file + DB rows.
- **Secrets** in Railway env vars: `DATABASE_URL`, `FINNHUB_API_KEY`, `ANTHROPIC_API_KEY`. App preferences (paper name, score threshold) live in the `settings` table, not env vars, so they are editable from the Settings page.

## Data model

Six tables. No Users table — preferences are config rows.

**settings** — single row: `id, paperName, scoreThreshold (default 5), lastVisitAt`. Edited from the Settings page; `lastVisitAt` is updated on each front-page load and powers the new-since-last-visit counts (counts are computed against the pre-update value, so a refresh doesn't zero them instantly).

**tickers** — `id, symbol (unique), note, createdAt, price, dayChangePct, quoteUpdatedAt`. Watchlist; drives Finnhub company-news calls. The quote columns are refreshed by the 15-min poll and feed the masthead ticker strip — so the read path stays DB-only.

**feeds** — `id, name, url (unique), section, enabled`. RSS sources, managed in Settings. Seeded (CBC Montréal, McGill Reporter, TechCrunch, Fragrantica, etc.).

**topics** — `id, keyword, section, enabled`. Interest keywords ("M&A", "hypertrophy", "AI agents"). Used to filter HackerNews stories and to build the curator's interest profile — editing topics immediately changes scoring behavior.

**articles**
- Identity: `id, url (unique), urlHash, title, summary, source, sourceType (finnhub|rss|hn)`
- Classification: `section (equities|finance|tech|local|fitness|fragrance), tickerSymbol (nullable)` — one enum value per front-page section header; `feeds.section` and `topics.section` use the same enum
- Curation: `score (0–10, nullable), scoreReason, clickbait (bool)`
- Lifecycle: `publishedAt, fetchedAt, status (unread|read|dismissed)`

**ingestionRuns** — `id, startedAt, finishedAt, articlesFetched, articlesKept, tokensUsed, error`. Powers "Updated N min ago" and debugging dead sources.

**Filter-at-display, not filter-at-save** (deliberate deviation from the PRD — the user-provided brief at the top of this project's conversation; its US2 says "filter before saving"): every fetched article is saved with its score; the front page shows `score >= settings.scoreThreshold AND NOT clickbait`. The threshold is tunable in Settings without re-fetching, and the Settings audit panel lists what was hidden and why.

**Retention:** articles deleted after 30 days (dismissed after 7), run by the hourly job.

## Ingestion & curation pipeline

**Cadence** (node-cron in `instrumentation.ts`):
- Every 15 min: Finnhub company news per ticker + general market/econ news, plus watchlist quotes. Well inside the 60 calls/min free tier.
- Hourly: RSS feeds + HackerNews top/best filtered by topics.
- On demand: "Refresh now" masthead button → same `runIngestion()`. An in-process lock prevents overlapping runs.

**Normalize → dedupe:** fetchers emit a common `RawArticle`. Dedupe: (1) skip URLs already in DB; (2) within the batch, drop near-duplicate normalized titles, keeping the higher-priority source (priority order: finnhub > rss > hn).

**Haiku curation:** only new articles are scored (typically 5–30/run) in one batched `claude-haiku-4-5` call containing the interest profile (from `topics` + `tickers`) and each article's title/summary/source. Returns per article: `score` 0–10, `clickbait` bool, one-line `scoreReason`, and `section` when the fetcher couldn't infer it. Structured JSON validated with Zod. Cost at ~2,000 articles/month: well under $1.

**Failure isolation:** each fetcher wrapped in its own try/catch — one dead source never kills a run; errors land in `ingestionRuns.error`. If the Haiku call fails, articles save with `score = null` and display unfiltered with an "unscored" tag; the next run rescores null-score articles.

## UI

Two pages, classic broadsheet, light paper theme (`#FCFBF7` paper, near-black ink, `#8b0000` kickers).

**Front page `/`:**
- Masthead: configurable paper name (default *The Dursun Dispatch*), date line "Thursday, July 9 · Montréal", "Updated 4 min ago · Refresh" on the right. Thick rule below.
- Ticker strip under the masthead: watchlist quotes (symbol, price, day change) rendered from the quote columns on `tickers`, which the 15-min poll refreshes from Finnhub's quote endpoint. IBM Plex Mono.
- Column 1 (wide): top-scored article as the lead (large headline, summary, scoreReason as an italic deck), then the Equities & Portfolio feed, items tagged with ticker symbols.
- Column 2: Technology, then Strategic Finance.
- Column 3: local/lifestyle rail — Montréal & McGill, Fitness Research, Fragrance.
- Typography: Newsreader (masthead, headlines), Source Serif 4 (body), IBM Plex Mono (data, timestamps). Hairline column rules, small-caps kickers.
- Interactions: headline click → opens original in new tab + marks read (read items fade to lower opacity); hover × dismisses; section headers show new-since-last-visit counts (articles fetched after `settings.lastVisitAt`). Server components + minimal client handlers.
- Responsive: columns stack in priority order (lead/equities → tech/finance → lifestyle).

**Settings `/settings`:** same aesthetic, utilitarian. CRUD tables for tickers, feeds, topics; paper-name field and score-threshold slider (both persisted to the `settings` table); curation audit panel ("41 fetched, 12 filtered today" + expandable list of hidden articles with reasons).

## Error handling (user-facing)

- Failed last run → masthead shows "Updated 2h ago ⚠" with error on hover; last good edition still renders.
- Empty section → one-line "Nothing new in Technology", not a gap.
- Unscored articles → shown with "unscored" tag, never silently dropped.
- Settings validation inline; new RSS URLs are test-fetched before saving, failures shown at the field.

## Testing

Vitest, TDD.

- **Unit:** per-fetcher normalizers against recorded fixture payloads; dedupe (exact + near-duplicate); Haiku response parsing/Zod; threshold display query.
- **Integration:** `runIngestion()` against test Postgres with mocked HTTP — correct sections/scores/dedupe, and one failing source doesn't poison the run.
- **Out of scope:** pixel-level UI tests, live third-party API calls (fixtures only).

## Deployment

- Railway: one service (Next.js standalone output) + Postgres plugin.
- Migrations: `drizzle-kit` on deploy.
- Seed script loads starter tickers, feeds, topics on first boot.
- Local dev: Dockerized Postgres, same seed.

## Out of scope for v1

- Multi-user/auth, save-for-later, NewsAPI, dark mode, push notifications, email digests, full-article extraction (links open the original site), separate worker service.
