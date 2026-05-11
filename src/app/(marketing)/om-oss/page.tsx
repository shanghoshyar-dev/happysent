import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Happysent gör det enkelt för företag att fira sina anställda – utan tidskrävande administration.",
};

export default function OmOssPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-5xl text-slate-900">
        Vi tror på små gester med stor effekt.
      </h1>

      <div className="prose-happysent mt-8 space-y-6 text-lg text-slate-600">
        <p>
          Happysent föddes ur en enkel iakttagelse: chefer vill fira sina
          anställda, men det är alltid någon i HR som måste komma ihåg, beställa
          och springa till bageriet. Resultatet blir antingen en pinsam
          uteblivelse eller en stressad eftermiddag.
        </p>

        <p>
          Vi byggde Happysent för att den där känslan av att vara <em>sedd</em>{" "}
          på sin födelsedag är värd mycket mer på jobbet än vad man tror — och
          för att det inte ska kosta er en enda minut av administration.
          Företaget registrerar sina anställda en gång, sedan dyker det upp en
          färsk tårta från ett lokalt bageri på födelsedagen. År efter år.
        </p>

        <p className="rounded-2xl border-l-4 border-candy-400 bg-candy-50/60 px-6 py-4 text-lg italic text-slate-700">
          Vi finns just nu i Malmö – fler städer kommer snart.
        </p>

        <p>
          Vi väljer bagerierna själva, besöker dem, smakar deras tårtor och
          betalar dem rättvist. Du som kund får en samlingsfaktura i månaden
          och slipper allt mellansnack. Vi tror på lokala hantverkare framför
          industribagerier, och på enkelhet framför portaler.
        </p>

        <h2 className="font-display text-3xl text-slate-900">Vår vision</h2>
        <p>
          Att inga anställda ska känna sig glömda på sin födelsedag, och att
          inga HR-team ska behöva komma ihåg dem. Det räcker att Happysent gör
          det.
        </p>

        <h2 className="font-display text-3xl text-slate-900">Det vi lovar</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>En färsk tårta på födelsedagen — eller pengarna tillbaka.</li>
          <li>Inga abonnemangsavgifter, ingen lock-in.</li>
          <li>Lokala bagerier som vi själva har valt ut.</li>
          <li>
            Personliga svar inom en arbetsdag — inga supportbiljetter eller
            chattbottar.
          </li>
        </ul>
      </div>

      <div className="mt-14 flex flex-col gap-4 sm:flex-row">
        <Link href="/kontakt" className="sm:flex-1">
          <Button className="w-full">Säg hej</Button>
        </Link>
        <Link href="/hur-det-fungerar" className="sm:flex-1">
          <Button variant="ghost" className="w-full">
            Så funkar det
          </Button>
        </Link>
      </div>
    </article>
  );
}
