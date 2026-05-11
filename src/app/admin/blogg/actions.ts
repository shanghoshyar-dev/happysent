"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

function optStr(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

async function ensureUniqueSlug(
  supabase: SupabaseClient<Database>,
  baseSlug: string,
  excludePostId?: string,
): Promise<string> {
  let slug = baseSlug || "inlagg";
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const { data } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === excludePostId) return candidate;
    n += 1;
  }
}

async function buildPayload(
  supabase: SupabaseClient<Database>,
  formData: FormData,
  existing: { id: string; slug: string; published_at: string | null } | null,
) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Titel krävs.");

  const rawSlug = String(formData.get("slug") ?? "").trim();
  const baseSlug = rawSlug ? slugify(rawSlug) : slugify(title);
  const slug = await ensureUniqueSlug(
    supabase,
    baseSlug,
    existing?.id,
  );

  const isPublished = formData.get("is_published") === "on";
  const published_at = isPublished
    ? existing?.published_at ?? new Date().toISOString()
    : null;

  const author =
    String(formData.get("author") ?? "").trim() || "Happysent";

  return {
    title,
    slug,
    content: String(formData.get("content") ?? ""),
    author,
    is_published: isPublished,
    published_at,
    excerpt: optStr(formData, "excerpt"),
    meta_title: optStr(formData, "meta_title"),
    meta_description: optStr(formData, "meta_description"),
    og_image_url: optStr(formData, "og_image_url"),
  };
}

export async function createBlogPost(formData: FormData) {
  const supabase = createClient();
  const payload = await buildPayload(supabase, formData, null);
  const { error } = await supabase.from("blog_posts").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  revalidatePath(`/blogg/${payload.slug}`);
  redirect("/admin/blogg");
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id, slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (!existing) throw new Error("Inlägget hittades inte.");

  const payload = await buildPayload(supabase, formData, existing);
  const { error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/blogg");
  revalidatePath(`/admin/blogg/${id}`);
  revalidatePath("/blogg");
  revalidatePath(`/blogg/${existing.slug}`);
  if (payload.slug !== existing.slug) {
    revalidatePath(`/blogg/${payload.slug}`);
  }
}

export async function deleteBlogPost(id: string) {
  const supabase = createClient();
  const { data: row } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  if (row?.slug) revalidatePath(`/blogg/${row.slug}`);
  redirect("/admin/blogg");
}
