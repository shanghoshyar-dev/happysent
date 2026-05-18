import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { svMarketingPageMeta } from "@/lib/marketing-metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = svMarketingPageMeta({
  title: "Blogg om anställdas välmående – Happysent",
  description:
    "Tankar om företagskultur, personalförmåner och firande på jobbet – med fokus på Malmö och nordiska kontor.",
  path: "/blogg",
});

export const revalidate = 60;

export default async function BloggPage() {
  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, author, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-display text-5xl text-forest-800">Bloggen</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Inspiration för HR och chefer som vill lyfta{" "}
          <strong>anställdas välmående</strong>, stärka{" "}
          <strong>företagskultur</strong> och göra{" "}
          <strong>födelsedag på jobbet</strong> en självklarhet – inte minst i{" "}
          <strong>Malmö</strong>.
        </p>
        <div className="mt-12 space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/blogg/${post.slug}`}
                className="group block rounded-2xl border border-cream-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-coral-200 hover:shadow-md"
              >
                <h2 className="font-display text-2xl text-slate-900 transition-colors group-hover:text-coral-700">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {post.excerpt?.trim() ||
                    post.title.slice(0, 140)}
                </p>
                <p className="mt-4 text-xs text-slate-400">
                  {post.published_at
                    ? formatDate(post.published_at.slice(0, 10))
                    : ""}
                  {post.author ? ` · ${post.author}` : ""}
                </p>
              </Link>
            ))
          ) : (
            <EmptyState
              title="Inga inlägg ännu"
              description="Vi publicerar snart texter om motivation och firande på jobbet."
            />
          )}
        </div>
      </div>
    </section>
  );
}
