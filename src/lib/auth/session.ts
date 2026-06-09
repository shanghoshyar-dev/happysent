import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface CompanySession {
  userId: string;
  email: string | undefined;
  companyId: string;
  companyName: string;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] isAdminUser:", error.message);
    return false;
  }
  return Boolean(data);
}

export async function getCompanySession(): Promise<CompanySession | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership, error: memErr } = await supabase
    .from("company_users")
    .select("company_id, companies:company_id ( name )")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (memErr || !membership) return null;

  const company = membership.companies as { name: string } | null;
  if (!company?.name) return null;

  return {
    userId: user.id,
    email: user.email,
    companyId: membership.company_id,
    companyName: company.name,
  };
}

/** Koppla inbjuden Auth-användare till företag (körs vid första inloggning). */
export async function ensureCompanyUserFromInvite(
  userId: string,
  email: string | undefined,
  companyIdFromMeta: string | undefined,
): Promise<string | null> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.company_id) return existing.company_id;

  let companyId = companyIdFromMeta?.trim() || null;

  if (!companyId && email) {
    const { data: invite } = await admin
      .from("company_portal_invites")
      .select("company_id")
      .ilike("email", email.trim())
      .is("accepted_at", null)
      .order("invited_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    companyId = invite?.company_id ?? null;
  }

  if (!companyId) return null;

  const { error: insErr } = await admin.from("company_users").insert({
    user_id: userId,
    company_id: companyId,
  });
  if (insErr && !insErr.message.includes("duplicate")) {
    console.error("[auth] ensureCompanyUserFromInvite:", insErr.message);
    return null;
  }

  if (email) {
    await admin
      .from("company_portal_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .ilike("email", email.trim());
  }

  return companyId;
}

export async function resolvePostLoginRedirect(
  userId: string,
  email: string | undefined,
  companyIdMeta: string | undefined,
): Promise<string> {
  if (await isAdminUser(userId)) return "/admin";

  const companyId = await ensureCompanyUserFromInvite(
    userId,
    email,
    companyIdMeta,
  );
  if (companyId) return "/kund";

  return "/kund/login?error=no_access";
}
