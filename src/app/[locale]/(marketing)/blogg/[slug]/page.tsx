import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { LocalizedLink } from "@/components/marketing/localized-link";
import { BlogMarkdown } from "@/components/marketing/blog-markdown";
import { localizedPath } from "@/i18n/routing";
import { parseLocaleParam } from "@/lib/parse-locale";
import { BlogShareButtons } from "@/components/marketing/blog-share-buttons";
import { readingTimeMinutesFromText } from "@/lib/reading-time";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const revalidate = 120;

interface Props {
  params: { slug: string; locale: string };
}

const site = getSiteUrl();

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  return (data ?? []).flatMap((p) => [
    { locale: "sv", slug: p.slug },
    { locale: "en", slug: p.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "title, meta_title, meta_description, excerpt, content, og_image_url, slug, published_at",
    )
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) return { title: "Inlägg" };

  const title =
    post.meta_title?.trim() || `${post.title} | HappySent`;
  const description =
    post.meta_description?.trim() ||
    post.excerpt?.trim() ||
    post.content.replace(/\s+/g, " ").slice(0, 155).trim() + "…";

  const locale = parseLocaleParam(params.locale);
  const canonical = `${site}${localizedPath(`/blogg/${post.slug}`, locale)}`;
  const ogImages = post.og_image_url?.trim()
    ? [{ url: post.og_image_url, width: 1200, height: 630, alt: post.title }]
    : [{ url: `${site}/opengraph-image`, width: 1200, height: 630, alt: post.title }];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: ogImages,
      locale: "sv_SE",
      siteName: "HappySent",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}

export default async function BloggPostPage({ params }: Props) {
  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) notFound();

  const { data: related } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, published_at")
    .eq("is_published", true)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(4);

  const relatedPosts = (related ?? []).filter((r) => r.slug !== post.slug).slice(0, 3);

  const minutes = readingTimeMinutesFromText(post.content);
  const shareUrl = `${site}/blogg/${post.slug}`;
  const descForShare =
    post.meta_description?.trim() ||
    post.excerpt?.trim() ||
    post.content.replace(/\s+/g, " ").slice(0, 200);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description:
      post.meta_description ||
      post.excerpt ||
      post.content.slice(0, 200),
    datePublished: post.published_at ?? undefined,
    ...(post.og_image_url?.trim()
      ? { image: [post.og_image_url.trim()] }
      : {}),
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "HappySent",
      url: site,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": shareUrl,
    },
    url: shareUrl,
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    articleSection: "Företagskultur",
    keywords: [
      "anställdas välmående",
      "födelsedag på jobbet",
      "motivera anställda",
      "företagskultur",
      "personalförmåner",
      "Malmö",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <LocalizedLink
          href="/blogg"
          className="text-sm font-medium text-coral-600 underline-offset-4 transition-colors hover:text-coral-700 hover:underline"
        >
          ← Tillbaka till bloggen
        </LocalizedLink>

        <header className="mt-6 border-b border-cream-200 pb-8">
          <p className="text-sm font-medium text-forest-600">
            Blogg ·{" "}
            {post.published_at ? formatDate(post.published_at.slice(0, 10)) : ""}{" "}
            · {post.author} · {minutes} min läsning
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-forest-800 sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        <div className="mt-10">
          <BlogMarkdown content={post.content} />
        </div>

        <footer className="mt-14 space-y-10 border-t border-cream-200 pt-10">
          <div>
            <h2 className="text-lg font-semibold text-forest-800">
              Dela inlägget
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Tipsa en kollega i HR eller chef som jobbar med{" "}
              <strong>anställdas välmående</strong> och{" "}
              <strong>personalförmåner</strong> i Malmö.
            </p>
            <div className="mt-4">
              <BlogShareButtons
                title={post.title}
                description={descForShare}
                shareUrl={shareUrl}
              />
            </div>
          </div>

          {relatedPosts.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-forest-800">
                Relaterade inlägg
              </h2>
              <ul className="mt-4 space-y-4">
                {relatedPosts.map((r) => (
                  <li key={r.slug}>
                    <LocalizedLink
                      href={`/blogg/${r.slug}`}
                      className="group block rounded-2xl border border-cream-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-coral-200 hover:shadow-md"
                    >
                      <span className="font-semibold text-slate-900 group-hover:text-coral-700">
                        {r.title}
                      </span>
                      {r.excerpt ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {r.excerpt}
                        </p>
                      ) : null}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl bg-forest-700 p-6 text-center text-white">
            <p className="font-display text-lg font-semibold">
              Vill ni automatisera <strong>födelsedag på jobbet</strong>?
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <LocalizedLink
                href="/kontakt"
                className="inline-flex rounded-full bg-coral-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-coral-600 active:scale-[0.98]"
              >
                Kontakta oss
              </LocalizedLink>
              <LocalizedLink
                href="/priser"
                className="inline-flex rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
              >
                Se priser
              </LocalizedLink>
            </div>
          </div>
        </footer>
      </article>
    </>
  );
}
