import Link from "next/link";
import type { Metadata } from "next";

import { svMarketingPageMeta } from "@/lib/marketing-metadata";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = svMarketingPageMeta({
  title: "Priser – Happysent",
  description:
    "Transparenta priser per levererad tårta. Inga uppstartsavgifter, ingen bindningstid.",
  path: "/priser",
});

const tiers = [
  {
    name: "Starter",
    price: "Från 449 kr",
    perCake: "per tårta, inkl. leverans",
    features: [
      "Upp till 25 anställda",
      "Lokalt utvalt bageri",
      "Automatiska påminnelser",
      "Månadsfaktura",
    ],
    cta: "Boka demo",
    highlighted: false,
  },
  {
    name: "Team",
    price: "Från 419 kr",
    perCake: "per tårta, inkl. leverans",
    features: [
      "Upp till 100 anställda",
      "Prioriterad support",
      "Anpassningsbart prissteg",
      "Månadsfaktura",
    ],
    cta: "Boka demo",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Offert",
    perCake: "individuell prissättning",
    features: [
      "Obegränsat antal anställda",
      "Flera städer",
      "Egen kontaktperson",
      "Integrationer mot HR-system",
    ],
    cta: "Kontakta oss",
    highlighted: false,
  },
];

export default function PriserPage() {
  return (
    <section className="bg-cream-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-5xl text-slate-900">
            Tydliga priser, ingen administration
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Du betalar bara för tårtor som faktiskt levereras. Pausa eller säg
            upp när du vill.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                tier.highlighted
                  ? "border-candy-300 bg-white shadow-soft"
                  : "border-candy-100 bg-white"
              }`}
            >
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
              <Link href="/kontakt" className="mt-8">
                <Button
                  variant={tier.highlighted ? "primary" : "secondary"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
