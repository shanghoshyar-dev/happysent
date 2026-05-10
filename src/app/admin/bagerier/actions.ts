"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
