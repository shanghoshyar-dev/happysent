/** Canonical public site URL (no trailing slash). Used for OG, canonical, sitemap. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw?.startsWith("http")) return raw.replace(/\/+$/, "");
  return "https://happysent.com";
}
