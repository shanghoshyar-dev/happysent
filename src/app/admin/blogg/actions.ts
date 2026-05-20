"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type BlogPostFormState = { error: string } | undefined;

function friendlyBlogDbError(message: string): string {
  const m = message.trim();
  if (/column .* does not exist|Could not find the .*column/i.test(m)) {
    return (
      `${m}\n\n` +
      "Trolig orsak: produktionsdatabasen saknar nya fält (slug, meta_title, meta_description osv.). " +
      "Kör Supabase-migrationerna mot samma projekt som Vercel använder (t.ex. `supabase db push` eller kör SQL från `supabase/migrations/` i Supabase Dashboard)."
    );
  }
  if (/row-level security|RLS|violates row-level security/i.test(m)) {
    return (
      `${m}\n\n` +
      "Kontrollera att du är inloggad som admin och att tabellen blog_posts har policy som tillåter insert/update för authenticated."
    );
  }
  if (/duplicate key|unique constraint|already exists/i.test(m)) {
    return (
      `${m}\n\n` +
      "Slug eller annat unikt värde finns redan. Ändra slug eller titel och försök igen."
    );
  }
  return m;
}

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
  const slug = await ensureUniqueSlug(supabase, baseSlug, existing?.id);

  const isPublished = formData.get("is_published") === "on";
  const published_at = isPublished
    ? existing?.published_at ?? new Date().toISOString()
    : null;

  const author =
    String(formData.get("author") ?? "").trim() || "HappySent";

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

export async function createBlogPost(
  _prev: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  const supabase = createClient();

  let payload;
  try {
    payload = await buildPayload(supabase, formData, null);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Valideringsfel.";
    return { error: msg };
  }

  const { error } = await supabase.from("blog_posts").insert(payload);
  if (error) {
    return { error: friendlyBlogDbError(error.message) };
  }

  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  revalidatePath(`/blogg/${payload.slug}`);
  redirect("/admin/blogg");
}

/** `id` bound first via `.bind(null, post.id)` for useFormState. */
export async function updateBlogPost(
  id: string,
  _prev: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id, slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { error: "Inlägget hittades inte." };
  }

  let payload;
  try {
    payload = await buildPayload(supabase, formData, existing);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Valideringsfel.";
    return { error: msg };
  }

  const { error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id);
  if (error) {
    return { error: friendlyBlogDbError(error.message) };
  }

  revalidatePath("/admin/blogg");
  revalidatePath(`/admin/blogg/${id}`);
  revalidatePath("/blogg");
  revalidatePath(`/blogg/${existing.slug}`);
  if (payload.slug !== existing.slug) {
    revalidatePath(`/blogg/${payload.slug}`);
  }

  return undefined;
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
