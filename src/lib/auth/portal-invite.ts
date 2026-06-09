import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthSiteUrl } from "@/lib/site-url";

export function portalInviteRedirectUrl(): string {
  return `${getAuthSiteUrl()}/auth/callback?next=/kund/aktivera`;
}

/** Skapar inbjudningslänk (välj lösenord) — skickas i HappySent-mejlet, inte bara /kund/login. */
export async function createPortalInviteLink(
  email: string,
  companyId: string,
): Promise<{ ok: true; actionLink: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const redirectTo = portalInviteRedirectUrl();

  const invite = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      data: { company_id: companyId },
      redirectTo,
    },
  });

  const actionLink = invite.data.properties?.action_link;
  if (!invite.error && actionLink) {
    return { ok: true, actionLink };
  }

  const msg = invite.error?.message ?? "";
  if (/already|registered|exists/i.test(msg)) {
    const recovery = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo,
      },
    });
    const recoveryLink = recovery.data.properties?.action_link;
    if (!recovery.error && recoveryLink) {
      return { ok: true, actionLink: recoveryLink };
    }
    return {
      ok: false,
      error: recovery.error?.message ?? "Kunde inte skapa återställningslänk.",
    };
  }

  return { ok: false, error: msg || "Kunde inte skapa inbjudningslänk." };
}
