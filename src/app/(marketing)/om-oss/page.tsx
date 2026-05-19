import type { Metadata } from "next";
import Link from "next/link";

import { svMarketingPageMeta } from "@/lib/marketing-metadata";

import { BrandName } from "@/components/brand-name";
import { CtaButton } from "@/components/marketing/cta-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = svMarketingPageMeta({
  title: "Om oss – Happysent",
  description:
    "Shang och Danny grundade Happysent i Malmö – läs hur idén föddes och varför vi vill att alla anställda ska kännas sedda på jobbet.",
  path: "/om-oss",
});

export default function OmOssPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-5xl text-slate-900">
        Vi är Shang och Danny
      </h1>

      <div className="prose-happysent mt-8 space-y-6 text-lg text-slate-600">
        <p>
          Vi är Shang och Danny, två bröder som grundade <BrandName />. Shang är 28
          och Danny är 22, och tillsammans har vi byggt något vi önskar hade
          funnits på varje arbetsplats vi någonsin besökt.
        </p>

        <p>
          Det hela började med en podcast. En kväll satt vi och lyssnade på
          ett avsnitt om unika affärsidéer när vi hörde om ett liknande koncept
          utomlands. Vi tittade på varandra och ställde samma fråga samtidigt.
          Varför finns inte det här i Sverige?
        </p>

        <p>
          Ingen av oss hade arbetat inom HR eller haft ett fancy kontorsjobb.
          Men vi visste båda hur det känns att gå till jobbet dag efter dag och
          aldrig riktigt känna sig sedd. Att prestera, bidra och engagera sig,
          men ändå känna att man enkelt kunde bytas ut mot vem som helst. Det är
          en känsla som saktar ner en människa inifrån, och vi ville göra något
          åt det.
        </p>

        <p>
          Shang bygger och driver systemet och ser till att varje leverans sker
          på rätt dag till rätt plats. Danny håller kontakten med kunderna och
          ser till att varje företag känner sig omhändertaget. Tillsammans
          täcker vi hela kedjan från teknik till tårta.
        </p>

        <h2 className="font-display text-3xl text-slate-900">Vår vision</h2>
        <p>
          Att inga anställda ska känna sig glömda på sin födelsedag, och att
          inga HR-team ska behöva komma ihåg dem. Det räcker att <BrandName /> gör
          det.
        </p>

        <h2 className="font-display text-3xl text-slate-900">Det vi lovar</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>En färsk tårta på födelsedagen eller pengarna tillbaka.</li>
          <li>Inga abonnemangsavgifter, ingen lock-in.</li>
          <li>Lokala bagerier som vi själva har valt ut.</li>
          <li>
            Personliga svar inom en arbetsdag, inga supportbiljetter eller
            chattbottar.
          </li>
        </ul>

        <p>
          Vi finns just nu i Malmö och fler städer tillkommer snart. Drömmen är
          enkel. Att ingen anställd i Sverige ska behöva fylla år på jobbet utan
          att bli sedd.
        </p>
      </div>

      <div className="mt-14 flex flex-col gap-4 sm:flex-row">
        <Link href="/kontakt" className="sm:flex-1">
          <CtaButton className="w-full" fullWidth>
            Säg hej
          </CtaButton>
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
