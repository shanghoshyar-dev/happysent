import type { Metadata } from "next";

import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { getMessages } from "@/i18n/get-messages";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.pricing;
  return marketingPageMeta({
    title: p.metaTitle,
    description: p.metaDescription,
    path: "/priser",
    locale,
  });
}

export default function PriserPage({ params }: Props) {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.pricing;
  const tiers = p.tiers.map((tier, index) => ({
    ...tier,
    highlighted: index === 1,
  }));

  return (
    <section className="bg-cream-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-5xl text-slate-900">{p.h1}</h1>
          <p className="mt-4 text-lg text-slate-600">{p.intro}</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                tier.highlighted
                  ? "border-candy-300 bg-white shadow-soft"
                  : "border-candy-100 bg-white"
              }`}
            >
              {tier.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-candy-500 px-3 py-0.5 text-xs font-medium text-white">
                  {p.popular}
                </span>
              ) : null}
              <h2 className="font-display text-2xl text-slate-900">
                {tier.name}
              </h2>
              <p className="mt-4 font-display text-4xl text-candy-500">
                {tier.price}
              </p>
              <p className="text-sm text-slate-500">{tier.perCake}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span aria-hidden className="text-candy-500">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <LocalizedLink href="/kontakt" className="mt-8 block">
                <CtaButton
                  variant={tier.highlighted ? "primary" : "secondary"}
                  className="w-full"
                  fullWidth
                >
                  {tier.cta}
                </CtaButton>
              </LocalizedLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
