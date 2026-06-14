"use client";

import Image from "next/image";

import { useLocale } from "@/i18n/locale-provider";

type PartnerLogo =
  | { kind: "image"; src: string; alt: string }
  | { kind: "text"; label: string; alt: string };

const logos: PartnerLogo[] = [
  { kind: "image", src: "/marketing/logos/crisha.png", alt: "Crisha Marketing" },
  {
    kind: "image",
    src: "/marketing/logos/carpathian.png",
    alt: "Carpathian Marketing Agency",
  },
  { kind: "text", label: "Shang Taxi", alt: "Shang Taxi" },
];

const marqueeLogos = [...logos, ...logos];

export function TrustedBy() {
  const { messages } = useLocale();
  const t = messages.trustedBy;

  return (
    <section
      aria-labelledby="trusted-by-heading"
      className="relative w-full min-w-0 overflow-x-clip border-t border-candy-100/60 bg-candy-gradient py-14"
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="trusted-by-heading"
          className="text-center font-display text-lg font-semibold text-slate-700"
        >
          {t.heading}
        </h2>
        <p className="sr-only">
          {t.srPartners}: {logos.map((l) => l.alt).join(", ")}.
        </p>
      </div>

      <div className="mx-auto mt-10 flex w-full justify-center px-4">
        <div className="trusted-by-marquee-window relative" aria-hidden>
          <div className="trusted-by-marquee-track flex w-max flex-nowrap">
            {marqueeLogos.map((logo, i) => (
              <div
                key={`${logo.alt}-${i}`}
                className="relative flex shrink-0 items-center px-6 md:px-10"
              >
                {logo.kind === "text" ? (
                  <span className="whitespace-nowrap font-display text-xl font-semibold tracking-tight text-slate-700 md:text-2xl">
                    {logo.label}
                  </span>
                ) : (
                  <div className="relative h-11 w-[10rem] md:h-12 md:w-44">
                    <Image
                      src={logo.src}
                      alt=""
                      fill
                      sizes="176px"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
