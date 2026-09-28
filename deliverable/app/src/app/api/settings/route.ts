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
  const json = await req.json().catch(() => null);
  const body = Body.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  if (Object.keys(body.data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }
  await db.update(settings).set(body.data).where(eq(settings.id, 1));
  return NextResponse.json({ ok: true });
}
