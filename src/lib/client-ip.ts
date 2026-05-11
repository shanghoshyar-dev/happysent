import { headers } from "next/headers";

/** Best-effort client IP for rate limiting behind proxies (e.g. Vercel). */
export function getRequestIp(): string {
  const h = headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}
