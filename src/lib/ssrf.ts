import { lookup } from "dns/promises";
import { isIP } from "net";

/**
 * Guard a URL before our server fetches it on a user's behalf (media proxy).
 * Rejects non-https schemes and any hostname that resolves to a private,
 * loopback, link-local, or reserved address. Returns a parsed URL on success
 * or null when the URL is disallowed.
 */
export async function safeFetchUrl(raw: string): Promise<URL | null> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  // Only allow https — never allow the proxy to reach internal http services.
  if (url.protocol !== "https:") return null;

  const host = url.hostname;

  // Reject literal IPs up front.
  const literalKind = isIP(host);
  if (literalKind !== 0) {
    if (literalKind === 4) return isPrivateIPv4(host) ? null : url;
    if (literalKind === 6) return isPrivateIPv6(host) ? null : url;
  }

  // Resolve the hostname and reject if ANY address is non-public.
  try {
    const addrs = await lookup(host, { all: true, verbatim: true });
    if (addrs.length === 0) return null;
    for (const { address, family } of addrs) {
      if (family === 4 && isPrivateIPv4(address)) return null;
      if (family === 6 && isPrivateIPv6(address)) return null;
    }
  } catch {
    // Unresolvable host — let the fetch fail naturally rather than block.
    return url;
  }

  return url;
}

function isPrivateIPv4(ip: string): boolean {
  const octets = ip.split(".").map((n) => parseInt(n, 10));
  if (octets.length !== 4 || octets.some((n) => Number.isNaN(n))) return true;
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64/10
    (a === 169 && b === 254) || // link-local
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const norm = ip.toLowerCase();
  return (
    norm === "::" ||
    norm === "::1" ||
    norm.startsWith("fe8") ||
    norm.startsWith("fe9") ||
    norm.startsWith("fea") ||
    norm.startsWith("feb") || // fe80::/10 link-local
    norm.startsWith("fc") ||
    norm.startsWith("fd") // fc00::/7 unique local
  );
}
