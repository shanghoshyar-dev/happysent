"use client";

import { useLocale } from "@/i18n/locale-provider";

const icons = ["📅", "🥐", "📬", "🇸🇪", "💳", "🎈"] as const;

export function Features() {
  const { messages } = useLocale();
  const f = messages.features;

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-slate-900">
            {f.heading}{" "}
            <span className="text-candy-500">{f.headingAccent}</span>
          </h2>
          <p className="mt-4 text-lg font-script font-normal text-slate-600">
            {f.tagline}
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {f.items.map((item, i) => (
            <div
              key={item.title}
              className="rounded-2xl border border-candy-100 bg-cream-50 p-6 transition-shadow hover:shadow-soft"
            >
              <div className="text-3xl" aria-hidden>
                {icons[i]}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
