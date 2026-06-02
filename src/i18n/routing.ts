import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";

/** Path without locale prefix (always starts with `/`). */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/")
    ? "en"
    : defaultLocale;
}

/** Public URL for a locale (Swedish has no prefix). */
export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) {
    return normalized === "/" ? "/" : normalized;
  }
  return normalized === "/" ? "/en" : `/en${normalized}`;
}

export function isMarketingPath(pathname: string): boolean {
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/valja-tarta")
  ) {
    return false;
  }
  return true;
}

/** Internal App Router path under `[locale]`. */
export function internalLocalePath(pathname: string): string {
  const stripped = stripLocalePrefix(pathname);
  const locale = localeFromPathname(pathname);
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}
