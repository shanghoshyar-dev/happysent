"use client";

import Image from "next/image";

import { BrandName } from "@/components/brand-name";
import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-provider";

export function Hero() {
  const { messages } = useLocale();
  const h = messages.hero;

  return (
    <section className="relative -mt-[var(--marketing-nav-offset)] min-h-[min(88vh,44rem)] overflow-hidden sm:min-h-[min(92vh,48rem)]">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/marketing/hero-cakes-flowers.avif"
          alt=""
          fill
          className="object-cover object-[center_42%]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#2c1f1a]/42" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2c1f1a]/22 via-[#2c1f1a]/32 to-[#2c1f1a]/52" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_42%,rgba(20,12,10,0.58)_0%,rgba(20,12,10,0.22)_55%,transparent_78%)]"
          aria-hidden
        />
        <div className="hero-vertical-slats absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(88vh,44rem)] max-w-3xl flex-col items-center justify-center px-6 pb-16 pt-28 text-center sm:min-h-[min(92vh,48rem)] sm:pb-20 sm:pt-28 md:pb-24 md:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/35 px-4 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md">
          <span aria-hidden>✨</span> {h.badge}
        </span>

        <h1 className="hero-text-shadow mt-8 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
          {h.titleBefore}
          <br />
          <span className="font-script text-4xl font-normal text-candy-200 sm:text-5xl md:text-6xl">
            {h.titleHighlight}
          </span>{" "}
          {h.titleAfter}
        </h1>

        <p className="hero-text-shadow-soft mt-6 max-w-xl text-base leading-relaxed text-white sm:text-lg">
          <BrandName className="text-white" /> {h.body}
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          <LocalizedLink href="/kontakt" className="sm:w-auto">
            <CtaButton size="lg" fullWidth className="sm:!w-auto">
              {h.ctaPrimary}
            </CtaButton>
          </LocalizedLink>
          <LocalizedLink href="/priser" className="sm:w-auto">
            <Button
              size="lg"
              variant="secondary"
              className="w-full border-white/25 bg-white/95 text-slate-900 hover:bg-white sm:w-auto"
            >
              {h.ctaSecondary}
            </Button>
          </LocalizedLink>
        </div>

        <p className="hero-text-shadow-soft mt-8 text-sm text-white/90">
          {h.footnote}
        </p>
      </div>
    </section>
  );
}
