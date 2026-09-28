import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { feeds } from "@/db/schema";
import { guardedFetch } from "@/lib/urlGuard";

const Body = z.object({
  name: z.string().min(1).max(80),
  url: z.string().url(),
  section: z.enum(["equities", "finance", "tech", "local", "fitness", "sports"]),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const body = Body.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "invalid feed" }, { status: 400 });

  try {
    // guardedFetch blocks private/metadata hosts and re-validates redirects (SSRF)
    const res = await guardedFetch(body.data.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    // Generic message: don't leak internal fetch errors to unauthenticated callers
    return NextResponse.json(
      { error: "Feed unreachable or not allowed — check the URL in your browser" },
      { status: 422 },
    );
  }

  await db.insert(feeds).values(body.data).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}
