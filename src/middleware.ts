import { NextResponse, type NextRequest } from "next/server";

import { isLocale } from "@/i18n/config";
import {
  internalLocalePath,
  isMarketingPath,
  localeFromPathname,
} from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const LOCALE_COOKIE = "happysent_locale";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isMarketingPath(pathname)) {
    return updateSession(request);
  }

  const locale = localeFromPathname(pathname);
  const internalPath = internalLocalePath(pathname);
  const segment = internalPath.split("/")[1] ?? "";

  if (!isLocale(segment)) {
    return updateSession(request);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPath;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-happysent-locale", locale);

  const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });

  rewriteResponse.headers.set("x-happysent-locale", locale);
  rewriteResponse.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const sessionResponse = await updateSession(request);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return rewriteResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|xlsx|ico|xml|txt|pdf)$).*)",
  ],
};
