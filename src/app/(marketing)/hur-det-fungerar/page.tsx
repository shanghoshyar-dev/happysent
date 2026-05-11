import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Hur det fungerar",
  description:
    "Från första registrering till färsk tårta på kontoret — så jobbar Happysent steg för steg.",
};

const steps = [
  {
    n: "01",
    title: "Vi tar emot din lista",
    body:
      "Du mejlar oss namn, födelsedag och avdelningens storlek på alla anställda du vill fira. Det räcker med ett mejl eller en enkel Excel-fil – vi sköter resten av administrationen.",
  },
  {
    n: "02",
    title: "Vi väljer ett lokalt bageri",
    body:
      "Vi matchar er adress med ett av våra lokala partnerbagerier. I Malmö samarbetar vi redan med några av stadens bästa konditorier, och fler städer är på väg.",
  },
  {
    n: "03",
    title: "Två veckor innan – ni får en bekräftelse",
    body:
      "Exakt 14 dagar innan födelsedagen får er kontaktperson ett mejl: ”Kalle fyller år om två veckor, tårtan är bokad.” Då vet ni att det är på gång.",
  },
  {
    n: "04",
    title: "En vecka innan – bageriet får beställningen",
    body:
      "Sju dagar innan skickar vi en beställning till bageriet med adress, namn, datum och antal personer. Samtidigt får ni en påminnelse: ”En vecka kvar – tårtan är beställd.”",
  },
  {
    n: "05",
    title: "Dagen innan – sista påminnelsen",
    body:
      "Dagen innan födelsedagen får ni ett kort mejl: ”Imorgon levereras tårtan mellan 08:00 och 11:00.” Inga överraskningar, ingen oro.",
  },
  {
    n: "06",
    title: "På födelsedagen – tårtan står på kontoret",
    body:
      "Mellan 08:00 och 11:00 dyker den färska tårtan upp i ert kök. Ni samlas, sjunger och firar. Vi tar hand om resten i bakgrunden.",
  },
  {
    n: "07",
    title: "I slutet av månaden – en faktura",
    body:
      "Ni får en samlingsfaktura per månad för alla levererade tårtor. Inga abonnemangsavgifter, inget krångel. Bara en rad per födelsedag.",
  },
];

const faqs = [
  {
    q: "Vad händer om födelsedagen är på en helg eller röd dag?",
    a: "Vi levererar närmaste vardag innan. Du behöver inte tänka på det – vi har koll på alla svenska helgdagar.",
  },
  {
    q: "Måste vi logga in någonstans?",
    a: "Nej. Du mejlar oss ändringar via vårt kontaktformulär, så uppdaterar vi listan. Inga lösenord, ingen portal att lära sig.",
  },
  {
    q: "Vad kostar det?",
    a: "Priset sätts per tårta och kan justeras utifrån avdelningens storlek. Hör av dig så ger vi en offert anpassad för er.",
  },
  {
    q: "Vad händer om någon slutar?",
    a: "Skicka in en borttagning via formuläret på kontaktsidan. Vi tar bort personen direkt och fakturerar bara för tårtor som faktiskt levereras.",
  },
];

export default function HurDetFungerarPage() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-display text-5xl text-slate-900">
            Så funkar Happysent – från start till tårta
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Vi tar bort hela det administrativa kring födelsedagar. Här är hela
            kedjan, steg för steg, så ni vet precis vad som händer.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <ol className="space-y-6">
            {steps.map((s) => (
              <li
                key={s.n}
                className="flex gap-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-candy-100"
              >
                <span className="font-display text-4xl text-candy-300">
                  {s.n}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {s.title}
                  </h2>
                  <p className="mt-2 leading-relaxed text-slate-600">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-cream-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-4xl text-slate-900">
            Vanliga frågor
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
            <Link href="/kontakt">
              <Button size="lg">Hör av dig så ses vi</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
