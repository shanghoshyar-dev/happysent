import type { Metadata } from "next";

import { BrandName } from "@/components/brand-name";
import { getMessages } from "@/i18n/get-messages";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

import { ContactForm } from "./contact-form";
import { EmployeeRequestForm } from "./employee-request-form";
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
            <div className="shrink-0">
              <h2 className="font-display text-2xl text-slate-900 xl:text-3xl">
                {p.existingTitle}
              </h2>
              <p className="mt-4 text-lg text-slate-600">{p.existingBody}</p>
              <div className="mt-4">
                <ExcelTemplateDownload label={p.excelLink} />
              </div>
            </div>
            <EmployeeRequestForm className="min-h-0 flex-1" />
          </div>
        </div>
      </div>
    </section>
  );
}
