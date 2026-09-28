import { lookup } from "dns/promises";
import { isIP } from "net";

// SSRF guard for endpoints that fetch user-supplied URLs (the feed test-fetch).
// Feed URLs stored in the DB only enter through the guarded endpoint, so the
// ingestion fetchers don't re-check. Pre-flight DNS + manual-redirect
// re-validation; residual DNS-rebinding TOCTOU is accepted for this
// single-user threat model.

export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice(7));
    return false;
  }
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true; // fail closed
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) || // link-local, incl. 169.254.169.254 metadata
    a >= 224 // multicast + reserved
  );
}

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("unsupported scheme");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host)
    ? [host]
    : (await lookup(host, { all: true })).map((r) => r.address);
  if (addresses.length === 0) throw new Error("unresolvable host");
  if (addresses.some(isPrivateIp)) throw new Error("host not allowed");
  return url;
}

/** Fetch a user-supplied URL with SSRF protection: validates every hop, max 3 redirects. */
export async function guardedFetch(raw: string, timeoutMs = 10_000): Promise<Response> {
  let target = raw;
  for (let hop = 0; hop <= 3; hop++) {
    const url = await assertPublicHttpUrl(target);
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location || hop === 3) throw new Error("too many redirects");
      target = new URL(location, url).toString();
      continue;
    }
    return res;
  }
  throw new Error("too many redirects");
}
