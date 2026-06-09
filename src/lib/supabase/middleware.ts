import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { isAdminUser } from "@/lib/auth/session";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[HappySent] Supabase env saknas — hoppar över session i middleware (fyll NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY i .env.local).",
      );
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options: CookieOptions;
            }[],
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isAdminRoute = pathname.startsWith("/admin");
    const isKundAktivera = pathname === "/kund/aktivera";
    const isKundRoute =
      pathname.startsWith("/kund") &&
      !pathname.startsWith("/kund/login") &&
      !isKundAktivera;
    const isAdminLogin = pathname === "/login";
    const isKundLogin = pathname === "/kund/login";
    const isAuthRoute =
      pathname.startsWith("/auth") || isAdminLogin || isKundLogin;

    if ((isAdminRoute || isKundRoute) && !user) {
      const url = request.nextUrl.clone();
      url.pathname = isKundRoute ? "/kund/login" : "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (user && isAdminRoute) {
      const admin = await isAdminUser(user.id);
      if (!admin) {
        const url = request.nextUrl.clone();
        url.pathname = "/kund";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    if (user && isKundRoute) {
      const { data: membership } = await supabase
        .from("company_users")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (!membership) {
        const url = request.nextUrl.clone();
        url.pathname = "/kund/login";
        url.searchParams.set("error", "no_access");
        return NextResponse.redirect(url);
      }
    }

    if (user && isAdminLogin) {
      const admin = await isAdminUser(user.id);
      if (admin) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    if (user && isKundLogin) {
      const { data: membership } = await supabase
        .from("company_users")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (membership) {
        const url = request.nextUrl.clone();
        url.pathname = "/kund";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    if (isAuthRoute && user && pathname.startsWith("/auth")) {
      // callback hanterar redirect
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[HappySent] Middleware Supabase-fel:", err);
    return NextResponse.next({ request });
  }
}
