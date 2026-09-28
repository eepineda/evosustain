CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"sport" text NOT NULL,
	"competition" text NOT NULL,
	"home" text NOT NULL,
	"away" text NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"detail" text,
	"status" text NOT NULL,
	"status_detail" text,
	"starts_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_external_id_unique" UNIQUE("external_id")
);
