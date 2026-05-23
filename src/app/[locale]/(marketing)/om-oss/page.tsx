import type { Metadata } from "next";

import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/i18n/get-messages";
import { brandify } from "@/lib/brandify";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.about;
  return marketingPageMeta({
    title: p.metaTitle,
    description: p.metaDescription,
    path: "/om-oss",
    locale,
  });
}

export default function OmOssPage({ params }: Props) {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.about;

  return (
    <article className="mx-auto max-w-3xl px-6 pb-20">
      <div className="inline-block rounded-3xl border border-candy-200 bg-white px-8 py-6 shadow-sm ring-1 ring-candy-100/60">
        <h1 className="font-display text-5xl text-slate-900">{p.h1}</h1>
      </div>

      <div className="prose-happysent mt-8 space-y-6 text-lg text-slate-600">
        {p.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{brandify(paragraph)}</p>
        ))}

        <h2 className="font-display text-3xl text-slate-900">{p.visionTitle}</h2>
        <p>{brandify(p.vision)}</p>

        <h2 className="font-display text-3xl text-slate-900">{p.promiseTitle}</h2>
        <ul className="list-disc space-y-2 pl-6">
          {p.promises.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p>{p.closing}</p>
      </div>

      <div className="mt-14 flex flex-col gap-4 sm:flex-row">
        <LocalizedLink href="/kontakt" className="sm:flex-1">
          <CtaButton className="w-full" fullWidth>
            {p.ctaHello}
          </CtaButton>
        </LocalizedLink>
        <LocalizedLink href="/hur-det-fungerar" className="sm:flex-1">
          <Button variant="secondary" className="w-full">
            {p.ctaHow}
          </Button>
        </LocalizedLink>
      </div>
    </article>
  );
}
