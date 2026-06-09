"use server";

import { resolvePostLoginRedirect } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function getPostLoginRedirectPath(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/login";

  const companyIdMeta =
    typeof user.user_metadata?.company_id === "string"
      ? user.user_metadata.company_id
      : undefined;

  return resolvePostLoginRedirect(user.id, user.email, companyIdMeta);
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
