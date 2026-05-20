import type { Metadata } from "next";

import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

/** Canonical titles + Open Graph for marketing routes (absolute titles). */
export function marketingPageMeta(opts: {
  title: string;
  description: string;
  /** Path without locale prefix, e.g. `/om-oss`. */
  path: string;
  locale: Locale;
  /** Open Graph locale tag (default from route locale). */
  ogLocale?: string;
}): Metadata {
  const base = getSiteUrl().replace(/\/$/, "");
  const normalized = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const canonicalPath = localizedPath(normalized, opts.locale);
  const url = `${base}${canonicalPath}`;
  const svUrl = `${base}${localizedPath(normalized, "sv")}`;
  const enUrl = `${base}${localizedPath(normalized, "en")}`;
  const ogLocale =
    opts.ogLocale ?? (opts.locale === "en" ? "en_US" : "sv_SE");

  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: {
      canonical: url,
      languages: {
        "sv-SE": svUrl,
        en: enUrl,
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      locale: ogLocale,
      siteName: "HappySent",
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

/** @deprecated Use marketingPageMeta with locale instead. */
export function svMarketingPageMeta(opts: {
  title: string;
  description: string;
  path: string;
  locale?: string;
}): Metadata {
  return marketingPageMeta({
    ...opts,
    locale: "sv",
    ogLocale: opts.locale,
  });
}
