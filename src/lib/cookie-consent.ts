export type CookieConsent = "necessary" | "analytics";

export const COOKIE_CONSENT_KEY = "happysent_cookie_consent";
export const COOKIE_CONSENT_CHANGED_EVENT = "happysent:cookie-consent-changed";
export const COOKIE_CONSENT_OPEN_EVENT = "happysent:cookie-consent-open";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getConsent(): CookieConsent | null {
  const raw = readCookie(COOKIE_CONSENT_KEY);
  if (raw === "necessary" || raw === "analytics") return raw;
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "analytics";
}

export function setConsent(consent: CookieConsent): void {
  writeCookie(COOKIE_CONSENT_KEY, consent);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent }),
    );
  }
}

export function clearConsent(): void {
  deleteCookie(COOKIE_CONSENT_KEY);
}

export function openCookieSettings(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT));
  }
}

export function getGaMeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id || !id.startsWith("G-")) return null;
  return id;
}

export function isAnalyticsPath(pathname: string): boolean {
  return (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth")
  );
}

export function applyConsentSideEffects(consent: CookieConsent): void {
  const measurementId = getGaMeasurementId();
  if (
    consent === "necessary" &&
    measurementId &&
    typeof window !== "undefined"
  ) {
    (window as unknown as Record<string, boolean | undefined>)[
      `ga-disable-${measurementId}`
    ] = true;
  }
}
