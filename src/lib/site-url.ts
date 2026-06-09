const PRODUCTION_SITE = "https://happysent.com";

/** Canonical public site URL (no trailing slash). Used for OG, canonical, sitemap. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw?.startsWith("http")) return raw.replace(/\/+$/, "");
  return PRODUCTION_SITE;
}

function isLocalhostUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

/**
 * URL for auth callbacks and portal invites sent by email.
 * End users must never get localhost links unless ALLOW_LOCALHOST_AUTH=1 (local testing).
 */
export function getAuthSiteUrl(): string {
  const explicit = process.env.AUTH_SITE_URL?.trim();
  if (explicit?.startsWith("http")) return explicit.replace(/\/+$/, "");

  const site = getSiteUrl();
  if (isLocalhostUrl(site) && process.env.ALLOW_LOCALHOST_AUTH !== "1") {
    return PRODUCTION_SITE;
  }
  return site;
}
