"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createEmployee(formData: FormData) {
  const supabase = createClient();
  const payload = {
    company_id: String(formData.get("company_id") ?? ""),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    is_active: formData.get("is_active") === "on",
  };
  const { error } = await supabase.from("employees").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/anstallda");
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = createClient();
  const payload = {
    company_id: String(formData.get("company_id") ?? ""),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    is_active: formData.get("is_active") === "on",
  };
  const { error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/anstallda");
  revalidatePath(`/admin/anstallda/${id}`);
}

export async function toggleEmployeeActive(id: string, next: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("employees")
    .update({ is_active: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/anstallda");
}

export async function deleteEmployee(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/anstallda");
}
