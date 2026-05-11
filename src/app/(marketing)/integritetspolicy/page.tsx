import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description:
    "Hur Happysent hanterar personuppgifter enligt GDPR – vad vi samlar in, varför, och hur länge.",
};

export default function IntegritetspolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-5xl text-slate-900">
        Integritetspolicy
      </h1>
      <p className="mt-4 text-sm text-slate-500">
        Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
      </p>

      <div className="prose-happysent mt-10 space-y-8 text-base leading-relaxed text-slate-700">
        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Kort sammanfattning
          </h2>
          <p className="mt-3">
            Happysent (vi) är personuppgiftsansvarig för de uppgifter som
            registreras av våra kundföretag. Vi följer GDPR och samlar bara in
            det vi måste för att kunna leverera en tårta till rätt person, på
            rätt dag, till rätt adress.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Vad vi samlar in
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Den anställdes förnamn och efternamn</strong> – för att
              bageriet ska kunna baka och leverera till rätt person.
            </li>
            <li>
              <strong>Födelsedag</strong> (datum, ej år är obligatoriskt) – för
              att veta när tårtan ska levereras.
            </li>
            <li>
              <strong>Leveransadress</strong> – arbetsplatsens besöksadress.
            </li>
            <li>
              <strong>Avdelningens storlek</strong> – för att veta hur stor
              tårta som ska bakas.
            </li>
            <li>
              <strong>Kontaktpersonens mejladress</strong> hos kundföretaget –
              för bekräftelser och fakturor.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Vad vi <em>inte</em> sparar
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Personnummer</li>
            <li>Löne- eller HR-uppgifter</li>
            <li>Hälsouppgifter eller andra känsliga personuppgifter</li>
            <li>Bank- eller kortuppgifter (fakturor skickas via PDF)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Varför vi samlar in det
          </h2>
          <p className="mt-3">
            Den rättsliga grunden är ett <strong>berättigat intresse</strong>{" "}
            (artikel 6.1 f GDPR): kundföretaget vill att vi firar deras
            anställda, och utan namn, datum och adress kan vi inte leverera
            tjänsten. Vi har gjort en intresseavvägning där behandlingen är
            minimal och i linje med vad den anställde rimligen kan förvänta sig
            i ett arbetsförhållande.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            Vem vi delar med
          </h2>
          <p className="mt-3">
            Vi delar enbart uppgifterna med det <strong>lokala bageri</strong>{" "}
            som är kopplat till företagets adress, och bara så mycket som
            behövs för att kunna leverera (namn, adress, datum, antal personer).
            Vi säljer aldrig data, vi använder dem inte till marknadsföring,
            och vi för inte över dem utanför EU/EES.
          </p>
          <p className="mt-3">
            Våra underbiträden för teknisk drift:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Supabase</strong> (databas, EU-region) –
              personuppgiftsbiträdesavtal finns.
            </li>
            <li>
              <strong>Resend</strong> (mejlleverans) – för bekräftelser och
              beställningar till bageri.
            </li>
            <li>
              <strong>Vercel</strong> (hosting, EU-region).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Hur länge</h2>
          <p className="mt-3">
            Vi sparar personuppgifter så länge ni är kund hos oss. När en
            anställd tas bort raderas personuppgifterna inom 30 dagar.
            Bokföringsunderlag (fakturor) sparas i 7 år enligt
            bokföringslagen.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Dina rättigheter</h2>
          <p className="mt-3">
            Som registrerad har du rätt att begära{" "}
            <strong>registerutdrag</strong>, <strong>rättelse</strong>,{" "}
            <strong>radering</strong>, <strong>begränsning</strong> eller{" "}
            <strong>dataportabilitet</strong> av dina uppgifter. Du har också
            rätt att invända mot vår behandling. Skicka en förfrågan till{" "}
            <a
              href="mailto:hej@happysent.se"
              className="font-medium text-candy-600 hover:underline"
            >
              hej@happysent.se
            </a>
            .
          </p>
          <p className="mt-3">
            Är du missnöjd med hur vi hanterar dina uppgifter kan du klaga hos{" "}
            <a
              href="https://www.imy.se/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-candy-600 hover:underline"
            >
              Integritetsskyddsmyndigheten (IMY)
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Säkerhet</h2>
          <p className="mt-3">
            All data lagras krypterat i databaser inom EU. Endast behörig
            personal hos Happysent har tillgång, och tillgången är skyddad med
            tvåfaktorsautentisering.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">Kontakt</h2>
          <p className="mt-3">
            Frågor? Skriv till{" "}
            <a
              href="mailto:hej@happysent.se"
              className="font-medium text-candy-600 hover:underline"
            >
              hej@happysent.se
            </a>{" "}
            eller via vårt{" "}
            <Link
              href="/kontakt"
              className="font-medium text-candy-600 hover:underline"
            >
              kontaktformulär
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
