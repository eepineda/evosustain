import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { topics } from "@/db/schema";

const Body = z.object({
  keyword: z.string().min(1).max(60),
  section: z.enum(["equities", "finance", "tech", "local", "fitness", "sports"]),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const body = Body.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "invalid topic" }, { status: 400 });
  await db.insert(topics).values(body.data).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}
