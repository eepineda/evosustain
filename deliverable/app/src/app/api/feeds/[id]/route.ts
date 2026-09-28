import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { feeds } from "@/db/schema";

const Id = z.coerce.number().int().positive();
const Body = z.object({ enabled: z.boolean() });

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Id.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const deleted = await db.delete(feeds)
    .where(eq(feeds.id, parsedId.data))
    .returning({ id: feeds.id });
  if (deleted.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Id.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const json = await req.json().catch(() => null);
  const body = Body.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const updated = await db.update(feeds)
    .set({ enabled: body.data.enabled })
    .where(eq(feeds.id, parsedId.data))
    .returning({ id: feeds.id });
  if (updated.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
