import type { Metadata } from "next";

import { BrandName } from "@/components/brand-name";
import { CtaButton } from "@/components/marketing/cta-button";
import { getMessages } from "@/i18n/get-messages";
import Link from "next/link";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

import { ContactForm } from "./contact-form";
import { ExcelTemplateDownload } from "./excel-template-download";

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.contact;
  return marketingPageMeta({
    title: p.metaTitle,
    description: p.metaDescription,
    path: "/kontakt",
    locale,
  });
}

export default function KontaktPage({ params }: Props) {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.contact;

  return (
    <section className="pb-20">
      <div className="mx-auto w-full max-w-6xl space-y-14 px-6">
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl text-black">
            {p.h1Before} <BrandName className="text-black" />
            {p.h1After}
          </h1>
          <p className="mt-4 text-lg text-black">
            {p.intro}{" "}
            <a
              href="mailto:info@happysent.com"
              className="font-medium text-black underline-offset-4 transition-colors hover:underline"
            >
              info@happysent.com
            </a>
            .
          </p>
          <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ExcelTemplateDownload
              label={p.excelLink}
              className="border-slate-300 text-black hover:border-slate-400 hover:bg-white"
            />
            <p className="text-sm text-black">{p.excelAfter}</p>
          </div>
          <dl className="mt-10 space-y-4 text-sm text-black">
            <div>
              <dt className="font-semibold text-black">{p.emailLabel}</dt>
              <dd>info@happysent.com</dd>
            </div>
            <div>
              <dt className="font-semibold text-black">{p.locationLabel}</dt>
              <dd>{p.locationValue}</dd>
            </div>
          </dl>
        </div>

        <div className="grid min-w-0 gap-10 rounded-3xl bg-cream-50 p-6 ring-1 ring-candy-100/50 sm:p-8 xl:grid-cols-2 xl:items-stretch xl:gap-12 xl:p-10">
          <div className="flex min-h-0 min-w-0 flex-col gap-4 xl:h-full">
            <h2 className="font-display text-2xl text-slate-900 xl:text-3xl">
              {p.newCustomerTitle}
            </h2>
            <p className="text-sm text-slate-600">{p.newCustomerBody}</p>
            <ContactForm className="min-h-0 flex-1" />
          </div>
          <div className="flex min-h-0 min-w-0 flex-col gap-6 xl:h-full">
            <div className="flex flex-1 flex-col gap-6 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm">
              <div>
                <h2 className="font-display text-2xl text-slate-900 xl:text-3xl">
                  {p.existingTitle}
                </h2>
                <p className="mt-4 text-lg text-slate-600">{p.existingBody}</p>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                {p.existingFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span aria-hidden className="text-candy-500">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/kund/login" className="mt-auto block">
                <CtaButton className="w-full" fullWidth>
                  {p.existingPortalCta}
                </CtaButton>
              </Link>
              <p className="text-sm text-slate-500">
                {p.existingHelp}{" "}
                <a
                  href="mailto:info@happysent.com"
                  className="font-medium text-slate-700 underline-offset-4 hover:underline"
                >
                  info@happysent.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
