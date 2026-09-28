import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { db } from "@/db";
import { articles } from "@/db/schema";

const Body = z.object({
  title: z.string().min(5).max(220),
  summary: z.string().max(800).optional().default(""),
  section: z.enum(["equities", "finance", "tech", "local", "fitness", "sports"]),
  author: z.string().max(120).optional().default("Evoford Journal"),
});

function slugify(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90); }

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid article" }, { status: 400 });
  const slug = `${Date.now()}-${slugify(body.data.title)}`;
  const url = `/editorial/${slug}`;
  const inserted = await db.insert(articles).values({
    url, urlHash: createHash("sha256").update(url).digest("hex"),
    title: body.data.title, summary: body.data.summary || null, source: body.data.author || "Evoford Journal",
    sourceType: "editorial", section: body.data.section, tickerSymbol: null, score: 10,
    scoreReason: "Original editorial publication", clickbait: false, publishedAt: new Date(), status: "unread",
  }).returning({ id: articles.id });
  return NextResponse.json({ ok: true, id: inserted[0]?.id, url });
}
