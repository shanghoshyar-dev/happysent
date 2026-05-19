"use client";

import { BrandName } from "@/components/brand-name";
import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-provider";

export function CtaBlock() {
  const { messages } = useLocale();
  const c = messages.cta;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl bg-candy-500 p-10 text-center text-white shadow-soft md:p-16">
          <h2 className="font-display text-4xl md:text-5xl">{c.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-candy-50/90">
            {c.body} <BrandName className="text-white" /> {c.bodyAfter}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LocalizedLink href="/kontakt">
              <CtaButton variant="secondary" size="lg">
                {c.primary}
              </CtaButton>
            </LocalizedLink>
            <LocalizedLink href="/priser">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-candy-600/30"
              >
                {c.secondary}
              </Button>
            </LocalizedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
