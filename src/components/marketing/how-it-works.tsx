"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/locale-provider";

function StepCard({
  step,
  className,
}: {
  step: { n: string; title: string; body: string };
  className?: string;
}) {
  return (
    <li
      className={cn(
        "rounded-2xl bg-white p-8 shadow-sm ring-1 ring-candy-100",
        className,
      )}
    >
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
          {steps.map((s) => (
            <StepCard key={s.n} step={s} />
          ))}
        </ol>
      </div>
    </section>
  );
}
