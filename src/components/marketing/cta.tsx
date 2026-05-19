import Link from "next/link";

import { CtaButton } from "@/components/marketing/cta-button";
import { Button } from "@/components/ui/button";

export function CtaBlock() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl bg-candy-500 p-10 text-center text-white shadow-soft md:p-16">
          <h2 className="font-display text-4xl md:text-5xl">
            Redo att fira riktigt?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-candy-50/90">
            Boka en kort demo så visar vi hur Happysent passar er och vilka
            bagerier som levererar i er stad.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/kontakt">
              <CtaButton variant="secondary" size="lg">
                Kom igång
              </CtaButton>
            </Link>
            <Link href="/priser">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-candy-600/30"
              >
                Se priser
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
