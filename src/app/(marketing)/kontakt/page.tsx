import type { Metadata } from "next";

import { ContactForm } from "./contact-form";
import { EmployeeRequestForm } from "./employee-request-form";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Hör av dig så bokar vi en kort demo och ser om Happysent passar er.",
};

export default function KontaktPage() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2">
          <div>
            <h1 className="font-display text-5xl text-slate-900">
              Säg hej till Happysent.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Skriv några rader om ert företag så hör vi av oss inom en
              arbetsdag. Eller mejla oss direkt på{" "}
              <a
                href="mailto:info@happysent.com"
                className="font-medium text-candy-600 hover:underline"
              >
                info@happysent.com
              </a>
              .
            </p>
            <dl className="mt-10 space-y-4 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-900">Mejl</dt>
                <dd>info@happysent.com</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Just nu i</dt>
                <dd>Malmö (fler städer på gång)</dd>
              </div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="bg-cream-50 py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-[1fr,1.4fr]">
          <div>
            <h2 className="font-display text-4xl text-slate-900">
              Redan kund?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Skicka in när någon börjar eller slutar så uppdaterar vi
              personallistan åt er. Du behöver inte logga in någonstans.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>• Vi svarar inom en arbetsdag</li>
              <li>• Bekräftelse skickas direkt till din mejl</li>
              <li>• Inga ändringar i pågående beställningar utan att vi hör av oss</li>
            </ul>
          </div>
          <EmployeeRequestForm />
        </div>
      </section>
    </>
  );
}
