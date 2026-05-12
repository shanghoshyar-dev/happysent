import Image from "next/image";

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
  },
] as const;

export function TrustedBy() {
  return (
    <section
      aria-labelledby="trusted-by-heading"
      className="border-t border-candy-100/60 bg-cream-50 py-14"
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="trusted-by-heading"
          className="text-center font-display text-lg font-semibold text-slate-700"
        >
          Kunder vi jobbar med
        </h2>
        <ul className="mt-10 flex list-none flex-wrap items-center justify-center gap-6 p-0 md:gap-10">
          {logos.map((logo) => (
            <li key={logo.src}>
              <div className="rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200/70">
                <div className="relative h-11 w-[10rem] md:h-12 md:w-44">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    sizes="176px"
                    className="object-contain"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
