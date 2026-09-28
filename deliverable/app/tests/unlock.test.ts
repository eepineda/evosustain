import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/unlock/route";

const KEY = "test-admin-key-0123456789abcdef";

describe("GET /unlock", () => {
  beforeEach(() => {
    process.env.ADMIN_KEY = KEY;
  });
  afterEach(() => {
    delete process.env.ADMIN_KEY;
  });

  it("returns 404 for a wrong key", async () => {
    const res = await GET(new NextRequest(`http://localhost/unlock?key=wrong`));
    expect(res.status).toBe(404);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("returns 404 when no key is provided", async () => {
    const res = await GET(new NextRequest(`http://localhost/unlock`));
    expect(res.status).toBe(404);
  });

  it("returns 404 when ADMIN_KEY is not configured", async () => {
    delete process.env.ADMIN_KEY;
    const res = await GET(new NextRequest(`http://localhost/unlock?key=${KEY}`));
    expect(res.status).toBe(404);
  });

  it("sets the admin cookie and redirects on the correct key", async () => {
    const res = await GET(new NextRequest(`http://localhost/unlock?key=${KEY}`));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("newspaper_admin=");
    expect(cookie.toLowerCase()).toContain("httponly");
  });
});
