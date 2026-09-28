import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { tickers } from "@/db/schema";

const Body = z.object({
  symbol: z.string().min(1).max(10)
    .transform((s) => s.toUpperCase())
    // Charset guard: the symbol is interpolated into the Finnhub request URL
    .refine((s) => /^[A-Z0-9.\-]+$/.test(s), "invalid symbol"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const body = Body.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "invalid symbol" }, { status: 400 });
  await db.insert(tickers).values({ symbol: body.data.symbol }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}
