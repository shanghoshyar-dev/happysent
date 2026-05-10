"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function buildPayload(formData: FormData) {
  const isPublished = formData.get("is_published") === "on";
  return {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    author: String(formData.get("author") ?? "Happysent").trim() || "Happysent",
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };
}

export async function createBlogPost(formData: FormData) {
  const supabase = createClient();
  const payload = buildPayload(formData);
  const { error } = await supabase.from("blog_posts").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  redirect("/admin/blogg");
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = createClient();
  const payload = buildPayload(formData);
  const { error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blogg");
  revalidatePath(`/admin/blogg/${id}`);
  revalidatePath("/blogg");
  revalidatePath(`/blogg/${id}`);
}

export async function deleteBlogPost(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  redirect("/admin/blogg");
}
