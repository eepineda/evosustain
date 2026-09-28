import { NextRequest, NextResponse } from "next/server";

// Write-protection without a login screen: reading the paper is open, but any
// mutating request requires the admin cookie set by visiting /unlock?key=ADMIN_KEY
// once per browser. When ADMIN_KEY is unset (local dev), everything stays open.

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") return NextResponse.next();
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return NextResponse.next();

  const cookie = request.cookies.get("newspaper_admin")?.value;
  if (cookie && cookie === (await sha256Hex(adminKey))) return NextResponse.next();

  return NextResponse.json(
    { error: "locked — open your unlock link in this browser first" },
    { status: 401 },
  );
}

export const config = { matcher: "/api/:path*" };
