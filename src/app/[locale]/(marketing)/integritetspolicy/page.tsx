import type { Metadata } from "next";
import Link from "next/link";

import { brandify } from "@/lib/brandify";
import { parseLocaleParam } from "@/lib/parse-locale";
import { marketingPageMeta } from "@/lib/marketing-metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = parseLocaleParam(params.locale);
  return marketingPageMeta({
    title: "Privacy Policy | Happysent",
    description:
      "How Happysent handles personal data under GDPR: what we collect, why, who we share with, retention, and your rights.",
    path: "/integritetspolicy",
    locale,
    ogLocale: "en_US",
  });
}

export default function IntegritetspolicyPage(_props: Props) {
  return (
    <article className="font-legal mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-5xl text-slate-900">Privacy Policy</h1>
      <p className="mt-4 text-sm text-slate-500">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="prose-happysent mt-10 space-y-8 text-base leading-relaxed text-slate-700">
        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Summary
          </h2>
          <p className="mt-3">
            {brandify(
              'Happysent ("we", "us") is the controller for the personal data submitted by our customer companies. We comply with the GDPR and only collect what we need to deliver a cake to the right person, on the right day, at the right address.',
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            What we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>The employee&apos;s first and last name</strong>, so the
              bakery can bake and deliver to the correct person.
            </li>
            <li>
              <strong>Date of birth</strong>, so we know when to deliver the
              cake. When someone submits add/remove requests via our website,
              we collect the full calendar date so we can tell employees apart
              in confirmations; you do not need to enter a complete national ID
              number.
            </li>
            <li>
              <strong>Delivery address</strong>, your workplace visit address.
            </li>
            <li>
              <strong>Department size</strong>, so we know what size of cake to
              order.
            </li>
            <li>
              <strong>Contact person&apos;s email</strong> at the customer
              company, for confirmations and invoices.
            </li>
            <li>
              <strong>Phone number</strong>, when you reach out as a potential new
              customer via our contact form, so we can call or message you about
              your enquiry.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            What we do <em>not</em> store
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Long-term storage of national identity numbers as general HR
              payroll records (we do not maintain personnel files beyond what is
              needed for deliveries)
            </li>
            <li>Salary or HR records</li>
            <li>Health data or other special categories of personal data</li>
            <li>
              Bank or card details (invoices are sent as PDF to your billing
              email)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Legal basis
          </h2>
          <p className="mt-3">
            We rely on{" "}
            <strong>legitimate interests</strong> (Article 6(1)(f) GDPR): your
            employer wants us to celebrate employees, and we cannot provide
            the service without name, birth date, and address. We have balanced
            those interests against employee privacy; processing is minimal and
            in line with what employees can reasonably expect in a workplace
            context.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Who we share with
          </h2>
          <p className="mt-3">
            We only share data with the <strong>local bakery</strong> assigned
            to your company&apos;s delivery area, and only what is needed to
            fulfil delivery (name, address, date, party size). We never sell
            data, we do not use it for marketing, and we do not transfer it
            outside the EU/EEA for processing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Retention</h2>
          <p className="mt-3">
            We keep personal data for as long as you remain a customer. When an
            employee is removed, their personal data is deleted within 30 days.
            Accounting records (invoices) are retained for 7 years as required
            by Swedish bookkeeping law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Your rights</h2>
          <p className="mt-3">
            You have the right to request{" "}
            <strong>access</strong>, <strong>rectification</strong>,{" "}
            <strong>erasure</strong>, <strong>restriction</strong>, or{" "}
            <strong>data portability</strong>, and to object to our processing.
            Contact us at{" "}
            <a
              href="mailto:info@happysent.com"
              className="font-medium text-candy-600 hover:underline"
            >
              info@happysent.com
            </a>
            .
          </p>
          <p className="mt-3">
            If you are unhappy with how we handle your data, you may lodge a
            complaint with the{" "}
            <a
              href="https://www.imy.se/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-candy-600 hover:underline"
            >
              Swedish Authority for Privacy Protection (IMY)
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Security</h2>
          <p className="mt-3">
            {brandify(
              "Data is stored in encrypted databases in the EU. Only authorised Happysent staff can access it, and access is protected with multi-factor authentication.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Contact</h2>
          <p className="mt-3">
            Questions? Email{" "}
            <a
              href="mailto:info@happysent.com"
              className="font-medium text-candy-600 hover:underline"
            >
              info@happysent.com
            </a>{" "}
            or use our{" "}
            <Link
              href="/kontakt"
              className="font-medium text-candy-600 hover:underline"
            >
              contact form
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
