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
    .order("created_at", { ascending: false })
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
  companyIdHint: string | undefined,
): Promise<string | null> {
  const admin = createAdminClient();
  const normalizedEmail = email?.trim();

  let targetCompanyId = companyIdHint?.trim() || null;

  if (!targetCompanyId && normalizedEmail) {
    const { data: invite } = await admin
      .from("company_portal_invites")
      .select("company_id")
      .ilike("email", normalizedEmail)
      .is("accepted_at", null)
      .order("invited_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    targetCompanyId = invite?.company_id ?? null;
  }

  const { data: existingRows } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const existingCompanyId = existingRows?.[0]?.company_id ?? null;

  if (targetCompanyId) {
    if (normalizedEmail) {
      const { data: inviteRow } = await admin
        .from("company_portal_invites")
        .select("company_id")
        .eq("company_id", targetCompanyId)
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (!inviteRow && existingCompanyId !== targetCompanyId) {
        return existingCompanyId;
      }
    }

    if (existingCompanyId !== targetCompanyId) {
      await admin.from("company_users").delete().eq("user_id", userId);
      const { error: insErr } = await admin.from("company_users").insert({
        user_id: userId,
        company_id: targetCompanyId,
      });
      if (insErr && !insErr.message.includes("duplicate")) {
        console.error("[auth] ensureCompanyUserFromInvite:", insErr.message);
        return existingCompanyId;
      }
    }

    if (normalizedEmail) {
      await admin
        .from("company_portal_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("company_id", targetCompanyId)
        .ilike("email", normalizedEmail);
    }

    return targetCompanyId;
  }

  return existingCompanyId;
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
