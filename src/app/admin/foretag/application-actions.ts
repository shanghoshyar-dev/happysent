"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function rejectCompanyApplication(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("company_applications")
    .update({
      status: "rejected",
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/foretag");
  return { ok: true };
}
