import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site-url";

/** Canonical titles + Open Graph for marketing routes (absolute titles). */
export function svMarketingPageMeta(opts: {
  title: string;
  description: string;
  path: string;
  /** Open Graph locale (default Swedish). */
  locale?: string;
}): Metadata {
  const base = getSiteUrl().replace(/\/$/, "");
  const url = `${base}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      locale: opts.locale ?? "sv_SE",
      siteName: "Happysent",
      type: "website",
      images: [{ url: `${base}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}
