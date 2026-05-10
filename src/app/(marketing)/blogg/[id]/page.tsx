import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, content")
    .eq("id", params.id)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) return { title: "Inlägg" };
  return {
    title: data.title,
    description: data.content.slice(0, 140),
  };
}

export default async function BloggPostPage({ params }: Props) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, title, content, author, published_at")
    .eq("id", params.id)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/blogg"
        className="text-sm font-medium text-candy-600 hover:underline"
      >
        ← Tillbaka till bloggen
      </Link>
      <h1 className="mt-6 font-display text-5xl text-slate-900">
        {post.title}
      </h1>
      <p className="mt-4 text-sm text-slate-500">
        {post.published_at ? formatDate(post.published_at.slice(0, 10)) : ""}
        {post.author ? ` · ${post.author}` : ""}
      </p>
      <div className="prose-happysent mt-10 whitespace-pre-line text-lg text-slate-700">
        {post.content}
      </div>
    </article>
  );
}
