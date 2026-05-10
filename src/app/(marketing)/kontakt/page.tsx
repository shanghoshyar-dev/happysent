import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Hör av dig så bokar vi en kort demo och ser om Happysent passar er.",
};

export default function KontaktPage() {
  return (
    <section className="py-20">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl text-slate-900">
            Säg hej till Happysent.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Skriv några rader om ert företag så hör vi av oss inom en arbetsdag.
            Eller mejla oss direkt på{" "}
            <a
              href="mailto:hej@happysent.se"
              className="font-medium text-candy-600 hover:underline"
            >
              hej@happysent.se
            </a>
            .
          </p>
          <dl className="mt-10 space-y-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-900">Mejl</dt>
              <dd>hej@happysent.se</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Just nu i</dt>
              <dd>Malmö (fler städer på gång)</dd>
            </div>
          </dl>
        </div>
        <form
          action="mailto:hej@happysent.se"
          method="post"
          encType="text/plain"
          className="space-y-5 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm"
        >
          <div>
            <Label htmlFor="name">Namn</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="company">Företag</Label>
            <Input id="company" name="company" required />
          </div>
          <div>
            <Label htmlFor="email">Mejl</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="message">Meddelande</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Berätta lite om ert team..."
              rows={5}
            />
          </div>
          <Button type="submit" className="w-full">
            Skicka
          </Button>
        </form>
      </div>
    </section>
  );
}
