import Image from "next/image";

import { cn } from "@/lib/utils";

const logos = [
  {
    src: "/marketing/logos/crisha.png",
    alt: "Crisha Marketing",
  },
  {
    src: "/marketing/logos/carpathian.png",
    alt: "Carpathian Marketing Agency",
  },
  {
    src: "/marketing/logos/shang-taxi.png",
    alt: "Shang Taxi",
    /** Vit bakgrund i PNG — multiply låter den smälta in i ljus gradient */
    knockOutWhiteBg: true,
  },
] as const;

/** Dubbel lista så `translate3d(-50%,0,0)` loopar sömlöst. */
const marqueeLogos = [...logos, ...logos];

export function TrustedBy() {
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
          Kunder vi jobbar med
        </h2>
        <p className="sr-only">
          Samarbetspartners: {logos.map((l) => l.alt).join(", ")}.
        </p>
      </div>

      {/* Avgränsad vyport — förhindrar att den breda marqueen driver horisontell scroll */}
      <div
        className="relative mx-auto mt-10 w-full max-w-full min-w-0 overflow-hidden px-0"
        aria-hidden
      >
        <div className="trusted-by-marquee-track flex w-max flex-nowrap">
          {marqueeLogos.map((logo, i) => (
            <div
              key={`${logo.src}-${i}`}
              className="relative shrink-0 px-6 md:px-10"
            >
              <div className="relative h-11 w-[10rem] md:h-12 md:w-44">
                <Image
                  src={logo.src}
                  alt=""
                  fill
                  sizes="176px"
                  className={cn(
                    "object-contain",
                    "knockOutWhiteBg" in logo &&
                      logo.knockOutWhiteBg &&
                      "mix-blend-multiply",
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
