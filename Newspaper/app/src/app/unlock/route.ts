import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sha256Hex } from "@/proxy";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest) {
  const adminKey = process.env.ADMIN_KEY;
  const key = req.nextUrl.searchParams.get("key");
  if (!adminKey || !key || !safeEqual(key, adminKey)) {
    // Indistinguishable from a missing page — don't advertise the endpoint
    return new NextResponse(null, { status: 404 });
  }
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("newspaper_admin", await sha256Hex(adminKey), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // unlock lasts a year per browser
    path: "/",
  });
  return res;
}
