"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createFlorist(formData: FormData) {
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
  const { error } = await supabase.from("florists").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bagerier");
  revalidatePath("/admin/foretag");
  redirect("/admin/bagerier");
}

export async function updateFlorist(id: string, formData: FormData) {
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
  const { error } = await supabase.from("florists").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bagerier");
  revalidatePath("/admin/foretag");
  revalidatePath(`/admin/blomsterbutiker/${id}`);
}

export async function deleteFlorist(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("florists").delete().eq("id", id);
  if (error) {
    throw new Error(
      error.message.includes("foreign key")
        ? "Blomsterbutiken används av minst ett företag som levererar blommor och kan inte tas bort. Ändra företaget först."
        : error.message,
    );
  }
  revalidatePath("/admin/bagerier");
  revalidatePath("/admin/foretag");
}

export async function deleteFloristAndRedirect(id: string) {
  await deleteFlorist(id);
  redirect("/admin/bagerier");
}
