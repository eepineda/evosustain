import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articles } from "@/db/schema";

const Body = z.object({ status: z.enum(["unread", "read", "dismissed"]) });

const Id = z.coerce.number().int().positive();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Id.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const json = await req.json().catch(() => null);
  const body = Body.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  const updated = await db.update(articles)
    .set({ status: body.data.status })
    .where(eq(articles.id, parsedId.data))
    .returning({ id: articles.id });
  if (updated.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
