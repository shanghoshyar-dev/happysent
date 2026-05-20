"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/locale-provider";

const STEP_MASCOT_IMAGES = [
  {
    src: "/marketing/how-it-works/step-1-register.png",
    alt: "",
  },
  {
    src: "/marketing/how-it-works/step-2-book.png",
    alt: "",
  },
  {
    src: "/marketing/how-it-works/step-3-deliver.png",
    alt: "",
  },
] as const;

const MASCOT_SIZE = 160;

function StepCard({
  step,
  mascotIndex,
  className,
}: {
  step: { n: string; title: string; body: string };
  mascotIndex: number;
  className?: string;
}) {
  const image = STEP_MASCOT_IMAGES[mascotIndex];

  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-candy-100 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative mb-6 flex h-32 items-center justify-center sm:h-44">
        <div
          className="absolute inset-x-4 top-2 bottom-2 rounded-2xl bg-white"
          aria-hidden
        />
        <div
          className={cn(
            "step-mascot relative h-28 w-28 sm:h-40 sm:w-40",
            mascotIndex === 1 && "step-mascot--delay-1",
            mascotIndex === 2 && "step-mascot--delay-2",
          )}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={MASCOT_SIZE}
            height={MASCOT_SIZE}
            className="h-full w-full object-contain"
            sizes="(max-width: 768px) 112px, 160px"
          />
        </div>
      </div>
      <span className="font-display text-5xl text-candy-300">{step.n}</span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
    </li>
  );
}

export function HowItWorks() {
  const { messages } = useLocale();
  const section = messages.howItWorksHome;
  const steps = section.steps.map((s, i) => ({
    n: String(i + 1).padStart(2, "0"),
    ...s,
  }));

  return (
    <section className="bg-cream-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-slate-900">
            {section.heading}
          </h2>
          <p className="mt-4 text-lg text-slate-600">{section.intro}</p>
        </div>

        <ol className="mt-16 grid list-none gap-6 p-0 md:grid-cols-3">
          {steps.map((s, i) => (
            <StepCard key={s.n} step={s} mascotIndex={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
