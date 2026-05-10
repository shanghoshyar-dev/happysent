import Link from "next/link";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blogg",
  description:
    "Tankar om företagskultur, småfest, bagerier och vardagsglädje – från Happysent.",
};

export const revalidate = 60;

export default async function BloggPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, content, author, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-display text-5xl text-slate-900">Bloggen</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Korta texter om hur man bygger ett företag där folk faktiskt trivs.
        </p>
        <div className="mt-12 space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/blogg/${post.id}`}
                className="block rounded-2xl border border-candy-100 bg-white p-6 transition-shadow hover:shadow-soft"
              >
                <h2 className="font-display text-2xl text-slate-900">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {post.content}
                </p>
                <p className="mt-4 text-xs text-slate-400">
                  {post.published_at ? formatDate(post.published_at.slice(0, 10)) : ""}
                  {post.author ? ` · ${post.author}` : ""}
                </p>
              </Link>
            ))
          ) : (
            <EmptyState
              title="Inga inlägg ännu"
              description="Vi skriver första posten snart. Kom tillbaka om en stund."
            />
          )}
        </div>
      </div>
    </section>
  );
}
