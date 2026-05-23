import type { Metadata } from "next";
import Image from "next/image";

import { BrandName } from "@/components/brand-name";
import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { getMessages } from "@/i18n/get-messages";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.howItWorks;
  return marketingPageMeta({
    title: p.metaTitle,
    description: p.metaDescription,
    path: "/hur-det-fungerar",
    locale,
  });
}

export default function HurDetFungerarPage({ params }: Props) {
  const locale = parseLocaleParam(params.locale);
  const page = getMessages(locale).pages.howItWorks;
  const steps = page.steps.map((step, index) => ({
    n: String(index + 1).padStart(2, "0"),
    ...step,
  }));
  const faqs = page.faqs;
  const [
    firstStep,
    secondStep,
    thirdStep,
    fourthStep,
    fifthStep,
    sixthStep,
    lastStep,
  ] = steps;

  return (
    <>
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-display text-5xl text-slate-900">
            {page.h1Before} <BrandName className="text-slate-900" />
            {page.h1After}
          </h1>
          <p className="mt-6 text-lg text-slate-600">{page.intro}</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <ol className="space-y-6">
            <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-candy-100">
              <div className="grid md:grid-cols-2 md:items-stretch">
                <div className="relative min-h-[14rem] w-full md:min-h-[17rem]">
                  <Image
                    src="/marketing/how-it-works-step1.avif"
                    alt={firstStep.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
                <div className="flex gap-6 p-8">
                  <span className="shrink-0 font-display text-4xl text-candy-300">
                    {firstStep.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {firstStep.title}
                    </h2>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {firstStep.body}
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-candy-100">
              <div className="grid md:grid-cols-2 md:items-stretch">
                <div className="flex gap-6 p-8">
                  <span className="shrink-0 font-display text-4xl text-candy-300">
                    {secondStep.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {secondStep.title}
                    </h2>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {secondStep.body}
                    </p>
                  </div>
                </div>
                <div className="relative min-h-[14rem] w-full md:min-h-[17rem]">
                  <Image
                    src="/marketing/how-it-works-step2.avif"
                    alt={secondStep.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </li>
            <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-candy-100">
              <div className="grid md:grid-cols-2 md:items-stretch">
                <div className="relative min-h-[14rem] w-full md:min-h-[17rem]">
                  <Image
                    src="/marketing/how-it-works-step3.avif"
                    alt={thirdStep.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex gap-6 p-8">
                  <span className="shrink-0 font-display text-4xl text-candy-300">
                    {thirdStep.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {thirdStep.title}
                    </h2>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {thirdStep.body}
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-candy-100">
              <div className="grid md:grid-cols-2 md:items-stretch">
                <div className="flex gap-6 p-8">
                  <span className="shrink-0 font-display text-4xl text-candy-300">
                    {fourthStep.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {fourthStep.title}
                    </h2>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {fourthStep.body}
                    </p>
                  </div>
                </div>
                <div className="relative min-h-[14rem] w-full md:min-h-[17rem]">
                  <Image
                    src="/marketing/how-it-works-step4.png"
                    alt={fourthStep.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </li>
            <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-candy-100">
              <div className="grid md:grid-cols-2 md:items-stretch">
                <div className="relative min-h-[14rem] w-full md:min-h-[17rem]">
                  <Image
                    src="/marketing/how-it-works-step5.avif"
                    alt={fifthStep.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex gap-6 p-8">
                  <span className="shrink-0 font-display text-4xl text-candy-300">
                    {fifthStep.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {fifthStep.title}
                    </h2>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {fifthStep.body}
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-candy-100">
              <div className="grid md:grid-cols-2 md:items-stretch">
                <div className="flex gap-6 p-8">
                  <span className="shrink-0 font-display text-4xl text-candy-300">
                    {sixthStep.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {sixthStep.title}
                    </h2>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {sixthStep.body}
                    </p>
                  </div>
                </div>
                <div className="relative min-h-[14rem] w-full md:min-h-[17rem]">
                  <Image
                    src="/marketing/how-it-works-step6.avif"
                    alt={sixthStep.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </li>
            <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-candy-100">
              <div className="grid md:grid-cols-2 md:items-stretch">
                <div className="relative min-h-[14rem] w-full md:min-h-[17rem]">
                  <Image
                    src="/marketing/how-it-works-step7.avif"
                    alt={lastStep.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex gap-6 p-8">
                  <span className="shrink-0 font-display text-4xl text-candy-300">
                    {lastStep.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {lastStep.title}
                    </h2>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {lastStep.body}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="bg-cream-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-4xl text-slate-900">
            {page.faqTitle}
          </h2>
          <dl className="mt-10 space-y-8">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-slate-900">{f.q}</dt>
                <dd className="mt-2 text-slate-600">{f.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 text-center">
            <LocalizedLink href="/kontakt">
              <CtaButton size="lg">{page.cta}</CtaButton>
            </LocalizedLink>
          </div>
        </div>
      </section>
    </>
  );
}
