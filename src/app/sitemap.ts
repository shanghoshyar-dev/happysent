import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/hur-det-fungerar",
    "/priser",
    "/om-oss",
    "/blogg",
    "/kontakt",
    "/integritetspolicy",
    "/anvandarvillkor",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const staticAssets: MetadataRoute.Sitemap = [
    {
      url: `${base}/happysent-mall.xlsx`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .eq("is_published", true);

  const blogUrls: MetadataRoute.Sitemap =
    posts?.map((p) => ({
      url: `${base}/blogg/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })) ?? [];

  return [...staticPages, ...staticAssets, ...blogUrls];
}
