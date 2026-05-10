import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Happysent gör det enkelt för företag att fira sina anställda – utan tidskrävande administration.",
};

export default function OmPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-5xl text-slate-900">
        Vi tror på små gester med stor effekt.
      </h1>
      <div className="prose-happysent mt-8 space-y-6 text-lg text-slate-600">
        <p>
          Happysent grundades med en enkel observation: chefer vill fira sina
          anställda, men det är någon i HR som alltid får påminna, beställa och
          springa till bageriet.
        </p>
        <p>
          Vi tar bort hela det jobbet. Företaget registrerar sina anställda en
          gång – sedan dyker det upp en färsk tårta från ett lokalt bageri på
          födelsedagen. År efter år.
        </p>
        <p>
          Vi startade i Malmö och växer staden för stad. Vi väljer bagerierna
          själva och betalar dem rättvist. Du som kund får en faktura i månaden
          och slipper allt mellansnack.
        </p>
        <h2 className="font-display text-3xl text-slate-900">Vår vision</h2>
        <p>
          Att inga anställda ska känna sig glömda på sin födelsedag, och att
          inga HR-team ska behöva komma ihåg dem. Det räcker att Happysent gör
          det.
        </p>
      </div>
    </article>
  );
}
