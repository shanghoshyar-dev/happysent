import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import {
  ensureCompanyUserFromInvite,
  isAdminUser,
  resolvePostLoginRedirect,
} from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function authFailRedirect(origin: string, next: string): string {
  if (next.startsWith("/kund")) {
    return `${origin}/kund/login?error=auth`;
  }
  return `${origin}/login?error=auth`;
}

async function finishAuthRedirect(
  origin: string,
  next: string,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  companyIdFromUrl?: string,
) {
  const companyIdMeta =
    companyIdFromUrl ||
    (typeof user.user_metadata?.company_id === "string"
      ? user.user_metadata.company_id
      : undefined);

  if (!(await isAdminUser(user.id))) {
    await ensureCompanyUserFromInvite(user.id, user.email, companyIdMeta);
  }

  const destination =
    next && (next.startsWith("/admin") || next.startsWith("/kund"))
      ? next
      : await resolvePostLoginRedirect(user.id, user.email, companyIdMeta);

  return NextResponse.redirect(`${origin}${destination}`);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "";
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const companyId = searchParams.get("company_id") ?? undefined;

  const supabase = createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      return finishAuthRedirect(origin, next, data.user, companyId);
    }
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error && data.user) {
      return finishAuthRedirect(origin, next, data.user, companyId);
    }
  }

  return NextResponse.redirect(authFailRedirect(origin, next));
}
