CREATE TYPE "public"."section" AS ENUM('equities', 'finance', 'tech', 'local', 'fitness', 'fragrance');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('finnhub', 'rss', 'hn');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('unread', 'read', 'dismissed');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"url_hash" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"source" text NOT NULL,
	"source_type" "source_type" NOT NULL,
	"section" "section" NOT NULL,
	"ticker_symbol" text,
	"score" integer,
	"score_reason" text,
	"clickbait" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "article_status" DEFAULT 'unread' NOT NULL,
	CONSTRAINT "articles_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "feeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"section" "section" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "feeds_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"articles_fetched" integer DEFAULT 0 NOT NULL,
	"articles_kept" integer DEFAULT 0 NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"paper_name" text DEFAULT 'The Dursun Dispatch' NOT NULL,
	"score_threshold" integer DEFAULT 5 NOT NULL,
	"last_visit_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tickers" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"price" real,
	"day_change_pct" real,
	"quote_updated_at" timestamp with time zone,
	CONSTRAINT "tickers_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"keyword" text NOT NULL,
	"section" "section" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "topics_keyword_section_unique" UNIQUE("keyword","section")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_ingestion_run" ON "ingestion_runs" USING btree (("finished_at" IS NULL)) WHERE "ingestion_runs"."finished_at" IS NULL;