"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { BAKERY_CATALOGS_BUCKET } from "@/lib/cake-selection/catalog-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type UploadBakeryCatalogResult =
  | { ok: true }
  | { ok: false; error: string };

export async function uploadBakeryCatalog(
  bakeryId: string,
  formData: FormData,
): Promise<UploadBakeryCatalogResult> {
  const file = formData.get("catalog_pdf");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Välj en PDF-fil." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Filen måste vara PDF." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "PDF får vara max 10 MB." };
  }

  const storagePath = `${bakeryId}/tartkatalog.pdf`;
  const admin = createAdminClient();
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await admin.storage
    .from(BAKERY_CATALOGS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadErr) {
    return { ok: false, error: uploadErr.message };
  }

  const supabase = createClient();
  const { error: updErr } = await supabase
    .from("bakeries")
    .update({ catalog_pdf_path: storagePath })
    .eq("id", bakeryId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/admin/bagerier");
  revalidatePath(`/admin/bagerier/${bakeryId}`);
  return { ok: true };
}

export async function clearBakeryCatalog(
  bakeryId: string,
): Promise<UploadBakeryCatalogResult> {
  const admin = createAdminClient();
  const { data: bakery } = await admin
    .from("bakeries")
    .select("catalog_pdf_path")
    .eq("id", bakeryId)
    .maybeSingle();

  if (bakery?.catalog_pdf_path) {
    await admin.storage
      .from(BAKERY_CATALOGS_BUCKET)
      .remove([bakery.catalog_pdf_path]);
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("bakeries")
    .update({ catalog_pdf_path: null })
    .eq("id", bakeryId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/bagerier");
  revalidatePath(`/admin/bagerier/${bakeryId}`);
  return { ok: true };
}

export async function createBakery(formData: FormData) {
  const supabase = createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim(),
    opening_hours: String(formData.get("opening_hours") ?? "").trim() || null,
    days_notice: Number(formData.get("days_notice") ?? 7),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
  const { error } = await supabase.from("bakeries").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bagerier");
  redirect("/admin/bagerier");
}

export async function updateBakery(id: string, formData: FormData) {
  const supabase = createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim(),
    opening_hours: String(formData.get("opening_hours") ?? "").trim() || null,
    days_notice: Number(formData.get("days_notice") ?? 7),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
  const { error } = await supabase.from("bakeries").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bagerier");
  revalidatePath(`/admin/bagerier/${id}`);
}

export async function deleteBakery(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("bakeries").delete().eq("id", id);
  if (error) {
    throw new Error(
      error.message.includes("foreign key")
        ? "Bageriet används av minst ett företag och kan inte tas bort. Flytta företagen först."
        : error.message,
    );
  }
  revalidatePath("/admin/bagerier");
}

export async function deleteBakeryAndRedirect(id: string) {
  await deleteBakery(id);
  redirect("/admin/bagerier");
}
