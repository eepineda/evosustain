import { NextResponse } from "next/server";
import { runIngestion } from "@/ingestion/run";

export async function POST() {
  const ran = await runIngestion("full");
  return NextResponse.json({ ok: true, skipped: !ran });
}
