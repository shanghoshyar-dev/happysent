"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
  const supabase = createClient();
  const name = String(formData.get("name") ?? "").trim();
  const bakeryId = String(formData.get("bakery_id") ?? "").trim();
  const dietaryNotes = String(formData.get("dietary_notes") ?? "").trim();
  if (!name) throw new Error("Namn krävs");
  if (!bakeryId) throw new Error("Bageri krävs");
  const { error } = await supabase.from("products").insert({
    name,
    bakery_id: bakeryId,
    dietary_notes: dietaryNotes || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produkter");
}

export async function toggleProduct(id: string, next: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produkter");
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produkter");
}
