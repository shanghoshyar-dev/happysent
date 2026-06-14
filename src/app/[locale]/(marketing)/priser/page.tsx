import type { Metadata } from "next";

import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { getMessages } from "@/i18n/get-messages";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";
import {
  groupCakePricesForDisplay,
  SEED_CAKE_PRICES,
} from "@/lib/pricing/cake-prices-data";
import { formatSek } from "@/lib/utils";

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
    highlighted: index === 0,
  }));
  const priceGroups = groupCakePricesForDisplay(SEED_CAKE_PRICES);

  return (
    <section className="bg-cream-50 pb-20">
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

        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl text-slate-900">
              {p.priceTableTitle}
            </h2>
            <p className="mt-3 text-slate-600">{p.priceTableIntro}</p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-candy-100 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-candy-100 bg-cream-50 text-slate-600">
                    <th className="px-6 py-4 font-medium">{p.cakeColumn}</th>
                    <th className="px-6 py-4 font-medium">{p.sizeColumn}</th>
                    <th className="px-6 py-4 font-medium text-right">
                      {p.priceColumn}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {priceGroups.map((group) =>
                    group.sizes.map((size, index) => (
                      <tr
                        key={`${group.cakeName}-${size.peopleCount}`}
                        className="border-b border-candy-50 last:border-b-0"
                      >
                        {index === 0 ? (
                          <td
                            className="px-6 py-4 align-top font-medium text-slate-900"
                            rowSpan={group.sizes.length}
                          >
                            <span className="flex flex-wrap items-center gap-2">
                              {group.cakeName}
                              {group.isDefault ? (
                                <span className="rounded-full bg-candy-100 px-2 py-0.5 text-xs font-medium text-candy-700">
                                  {p.defaultBadge}
                                </span>
                              ) : null}
                            </span>
                          </td>
                        ) : null}
                        <td className="px-6 py-4 text-slate-700">
                          {size.peopleCount} {p.peopleSuffix}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                          {formatSek(size.price)}
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">{p.vatNote}</p>
        </div>
      </div>
    </section>
  );
}
