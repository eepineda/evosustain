import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tickers } from "@/db/schema";

const Id = z.coerce.number().int().positive();

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Id.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const deleted = await db.delete(tickers)
    .where(eq(tickers.id, parsedId.data))
    .returning({ id: tickers.id });
  if (deleted.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
