import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { resolvePostLoginRedirect } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const companyIdMeta =
        typeof data.user.user_metadata?.company_id === "string"
          ? data.user.user_metadata.company_id
          : undefined;
      const destination =
        next && (next.startsWith("/admin") || next.startsWith("/kund"))
          ? next
          : await resolvePostLoginRedirect(
              data.user.id,
              data.user.email,
              companyIdMeta,
            );
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
