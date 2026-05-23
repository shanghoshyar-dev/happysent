import type { Metadata } from "next";

import { LocalizedLink } from "@/components/marketing/localized-link";
import { EmptyState } from "@/components/ui/empty-state";
import { getMessages } from "@/i18n/get-messages";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.blog;
  return marketingPageMeta({
    title: p.metaTitle,
    description: p.metaDescription,
    path: "/blogg",
    locale,
  });
}

export const revalidate = 60;

export default async function BloggPage({ params }: Props) {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.blog;
  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, author, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <section className="pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-display text-5xl text-forest-800">{p.h1}</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">{p.intro}</p>
        <div className="mt-12 space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <LocalizedLink
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
              </LocalizedLink>
            ))
          ) : (
            <EmptyState
              title={p.emptyTitle}
              description={p.emptyDescription}
            />
          )}
        </div>
      </div>
    </section>
  );
}
