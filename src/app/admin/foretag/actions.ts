"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createCompany(formData: FormData) {
  const supabase = createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    contact_email: String(formData.get("contact_email") ?? "").trim(),
    billing_email: String(formData.get("billing_email") ?? "").trim(),
    bakery_id: String(formData.get("bakery_id") ?? ""),
    price_per_cake: Number(formData.get("price_per_cake") ?? 0),
    status: String(formData.get("status") ?? "active") as "active" | "paused",
  };
  const { error } = await supabase.from("companies").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/foretag");
  redirect("/admin/foretag");
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    contact_email: String(formData.get("contact_email") ?? "").trim(),
    billing_email: String(formData.get("billing_email") ?? "").trim(),
    bakery_id: String(formData.get("bakery_id") ?? ""),
    price_per_cake: Number(formData.get("price_per_cake") ?? 0),
    status: String(formData.get("status") ?? "active") as "active" | "paused",
  };
  const { error } = await supabase.from("companies").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/foretag");
  revalidatePath(`/admin/foretag/${id}`);
}

export async function deleteCompany(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/foretag");
  redirect("/admin/foretag");
}
