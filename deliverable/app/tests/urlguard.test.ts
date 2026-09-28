import { describe, it, expect } from "vitest";
import { isPrivateIp, assertPublicHttpUrl } from "@/lib/urlGuard";

describe("isPrivateIp", () => {
  it("rejects loopback, RFC1918, link-local, metadata, and IPv6 private ranges", () => {
    for (const ip of [
      "127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1",
      "169.254.169.254", "0.0.0.0", "224.0.0.1", "::1", "fe80::1", "fd12::1",
      "::ffff:127.0.0.1",
    ]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("allows public addresses", () => {
    for (const ip of ["93.184.216.34", "8.8.8.8", "172.15.0.1", "172.32.0.1", "2606:4700::1111"]) {
      expect(isPrivateIp(ip), ip).toBe(false);
    }
  });

  it("fails closed on malformed input", () => {
    expect(isPrivateIp("not-an-ip")).toBe(true);
  });
});

describe("assertPublicHttpUrl", () => {
  it("rejects non-http(s) schemes", async () => {
    await expect(assertPublicHttpUrl("ftp://example.com/feed")).rejects.toThrow(/scheme/);
    await expect(assertPublicHttpUrl("file:///etc/passwd")).rejects.toThrow(/scheme/);
  });

  it("rejects literal private IPs and localhost", async () => {
    await expect(assertPublicHttpUrl("http://127.0.0.1:8080/x")).rejects.toThrow(/not allowed/);
    await expect(assertPublicHttpUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow(/not allowed/);
    await expect(assertPublicHttpUrl("http://localhost:3000/")).rejects.toThrow(/not allowed/);
  });
});
