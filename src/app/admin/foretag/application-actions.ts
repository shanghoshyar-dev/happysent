"use server";

import { revalidatePath } from "next/cache";

import { COMPANY_APPLICATION_UPLOADS_BUCKET } from "@/lib/storage/company-application-uploads";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function rejectCompanyApplication(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("company_applications")
    .select("employees_import_storage_path")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();

  if (row?.employees_import_storage_path) {
    await admin.storage
      .from(COMPANY_APPLICATION_UPLOADS_BUCKET)
      .remove([row.employees_import_storage_path]);
  }

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
