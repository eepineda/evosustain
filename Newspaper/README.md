# Evoford Journal — Premium Editorial Newspaper

Adapted from the uploaded **Personalized Newspaper** example. The original project's strongest ideas are preserved: classic broadsheet composition, Newsreader/Source Serif/IBM Plex Mono typography, database-backed ingestion, deduplication, scoring, refresh-now, read/dismiss tracking and a utilitarian settings desk.

## Editorial direction

**Evoford Journal** is positioned as a bilingual Spanish/English publication from London for Dominican and Latin American readers worldwide.

Sections:
- República Dominicana
- Latinoamérica · Economía
- Tecnología
- Londres · Caribe
- Sociedad · Ciencia
- Mundo
- Official-source briefing

## Automatic news engine

The existing ingestion architecture remains:
- RSS feeds
- Finnhub market/company news
- Hacker News
- deduplication
- relevance/clickbait scoring with Claude
- scheduled polling
- manual refresh
- PostgreSQL + Drizzle
- `/settings` for feeds/topics/tickers

Official-source links are kept in a dedicated Source Desk and Official Briefing so institutional material is clearly attributed.

## Run locally

Requirements: Node 20+, PostgreSQL.

```bash
cd app
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Deploy

This project is designed for a long-running Node deployment such as Railway because the scheduler and PostgreSQL ingestion pipeline are part of the application.

For GitHub Pages, only the static editorial shell can be deployed; the automatic RSS/DB/AI engine needs a server runtime.

## Language

Use the `EN / ES` control in the masthead. The choice is stored in a browser cookie and changes the editorial chrome without attempting to machine-translate source headlines.

## Important

Do not present automatically ingested source material as original reporting. Keep source names and original links visible. Editorial analysis should be clearly distinguished from sourced updates.
