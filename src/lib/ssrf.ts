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

  // Only allow HTTPS and standard HTTPS ports. Never allow credentials in a
  // proxied URL: they can create confusing authority parsing and leak secrets.
  if (url.protocol !== "https:" || url.username || url.password) return null;
  if (url.port && url.port !== "443") return null;

  const host = url.hostname;

  // Reject literal IPs up front.
  const literalKind = isIP(host);
  if (literalKind !== 0) {
    if (literalKind === 4) return isPrivateIPv4(host) ? null : url;
    if (literalKind === 6) return isPrivateIPv6(host) ? null : url;
  }

  // Resolve the hostname and reject if ANY address is non-public. A DNS
  // failure is rejected rather than passed to fetch, avoiding a validation
  // bypass and making the policy fail closed.
  try {
    const addrs = await lookup(host, { all: true, verbatim: true });
    if (addrs.length === 0) return null;
    for (const { address, family } of addrs) {
      if (family === 4 && isPrivateIPv4(address)) return null;
      if (family === 6 && isPrivateIPv6(address)) return null;
    }
  } catch {
    return null;
  }

  return url;
}

function isPrivateIPv4(ip: string): boolean {
  const octets = ip.split(".").map((n) => Number(n));
  if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b, c] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64/10
    (a === 169 && b === 254) || // link-local
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) || // IETF protocol assignments
    (a === 192 && b === 0 && c === 2) || // TEST-NET-1
    (a === 192 && b === 88 && c === 99) || // 6to4 relay anycast
    (a === 192 && b === 168) ||
    (a === 198 && b === 18) || // benchmarking
    (a === 198 && b === 19) ||
    (a === 198 && b === 51 && c === 100) || // TEST-NET-2
    (a === 203 && b === 0 && c === 113) || // TEST-NET-3
    a >= 224 // multicast and reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const norm = ip.toLowerCase();
  const mappedIpv4 = norm.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return (
    (mappedIpv4 ? isPrivateIPv4(mappedIpv4) : false) ||
    norm === "::" ||
    norm === "::1" ||
    norm.startsWith("fe8") ||
    norm.startsWith("fe9") ||
    norm.startsWith("fea") ||
    norm.startsWith("feb") || // fe80::/10 link-local
    norm.startsWith("fc") ||
    norm.startsWith("fd") || // fc00::/7 unique local
    norm.startsWith("ff") // multicast
  );
}
