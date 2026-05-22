import type { Metadata } from "next";

import { LocalizedLink } from "@/components/marketing/localized-link";
import { getMessages } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/config";
import { brandify } from "@/lib/brandify";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

type Props = { params: { locale: string } };

function formatUpdatedDate(locale: Locale): string {
  return new Date().toLocaleDateString(locale === "sv" ? "sv-SE" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.privacy;
  return marketingPageMeta({
    title: p.metaTitle,
    description: p.metaDescription,
    path: "/integritetspolicy",
    locale,
    ogLocale: locale === "sv" ? "sv_SE" : "en_US",
  });
}

export default function IntegritetspolicyPage({ params }: Props) {
  const locale = parseLocaleParam(params.locale);
  const p = getMessages(locale).pages.privacy;

  return (
    <article className="font-legal mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-5xl text-slate-900">{p.h1}</h1>
      <p className="mt-4 text-sm text-slate-500">
        {p.updatedLabel} {formatUpdatedDate(locale)}
      </p>

      <div className="prose-happysent mt-10 space-y-8 text-base leading-relaxed text-slate-700">
        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.summary.title}
          </h2>
          <p className="mt-3">{brandify(p.summary.body)}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.collect.title}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {p.collect.items.map((item) => (
              <li key={item.strong}>
                <strong>{item.strong}</strong>, {item.text}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.notCollect.title}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {p.notCollect.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.legalBasis.title}
          </h2>
          <p className="mt-3">{p.legalBasis.body}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.share.title}
          </h2>
          <p className="mt-3">{p.share.body}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.retention.title}
          </h2>
          <p className="mt-3">{p.retention.body}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.rights.title}
          </h2>
          <p className="mt-3">
            {p.rights.body}{" "}
            <a
              href="mailto:info@happysent.com"
              className="font-medium text-candy-600 hover:underline"
            >
              info@happysent.com
            </a>
            .
          </p>
          <p className="mt-3">
            {p.rights.complaintBefore}{" "}
            <a
              href="https://www.imy.se/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-candy-600 hover:underline"
            >
              {p.rights.complaintLink}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.security.title}
          </h2>
          <p className="mt-3">{brandify(p.security.body)}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            {p.contact.title}
          </h2>
          <p className="mt-3">
            {p.contact.beforeEmail}{" "}
            <a
              href="mailto:info@happysent.com"
              className="font-medium text-candy-600 hover:underline"
            >
              info@happysent.com
            </a>{" "}
            {p.contact.afterEmail}{" "}
            <LocalizedLink
              href="/kontakt/fraga"
              className="font-medium text-candy-600 hover:underline"
            >
              {p.contact.contactForm}
            </LocalizedLink>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
