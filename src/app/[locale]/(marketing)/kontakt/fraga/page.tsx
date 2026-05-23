import type { Metadata } from "next";

import { getMessages } from "@/i18n/get-messages";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

import { GeneralQuestionForm } from "./general-question-form";

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.generalQuestion;
  return {
    ...marketingPageMeta({
      title: p.metaTitle,
      description: p.metaDescription,
      path: "/kontakt/fraga",
      locale,
    }),
    robots: { index: false, follow: false },
  };
}

export default function GeneralQuestionPage({ params }: Props) {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.generalQuestion;

  return (
    <section className="pb-20">
      <div className="mx-auto w-full max-w-lg px-6">
        <div className="rounded-3xl bg-white/95 p-8 shadow-sm ring-1 ring-candy-100/60 backdrop-blur-sm sm:p-10">
          <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
            {p.h1}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{p.intro}</p>
          <GeneralQuestionForm className="mt-10" />
        </div>
      </div>
    </section>
  );
}
