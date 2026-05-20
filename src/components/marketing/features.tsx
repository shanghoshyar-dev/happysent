"use client";

import { CalendarRange } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { BrandCakeIcon } from "@/components/marketing/brand-cake-icon";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

const EMOJI_ICONS = ["📅", "📬", "💳", "🎈"] as const;

const CAKE_ICON_INDEX = 1;
const HOLIDAY_ICON_INDEX = 3;

function FeatureIcon({ index }: { index: number }) {
  if (index === CAKE_ICON_INDEX) {
    return <BrandCakeIcon size={28} className="h-7 w-7" />;
  }

  if (index === HOLIDAY_ICON_INDEX) {
    return (
      <CalendarRange
        className="h-6 w-6 text-candy-600"
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }

  const emojiIndex =
    index < CAKE_ICON_INDEX
      ? index
      : index < HOLIDAY_ICON_INDEX
        ? index - 1
        : index - 2;

  return (
    <span className="text-2xl leading-none" aria-hidden>
      {EMOJI_ICONS[emojiIndex]}
    </span>
  );
}

function FeatureCard({
  index,
  title,
  body,
  motionEnabled,
}: {
  index: number;
  title: string;
  body: string;
  motionEnabled: boolean;
}) {
  const stepNumber = String(index + 1).padStart(2, "0");

  const card = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-candy-100 transition-all",
        "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <span
        className="pointer-events-none absolute right-4 top-4 font-display text-2xl text-candy-200"
        aria-hidden
      >
        {stepNumber}
      </span>
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-candy-50 ring-1 ring-candy-100/80"
        aria-hidden
      >
        <FeatureIcon index={index} />
      </div>
      <h3 className="mt-4 pr-8 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );

  if (!motionEnabled) {
    return card;
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      {card}
    </motion.div>
  );
}

export function Features() {
  const { messages } = useLocale();
  const f = messages.features;
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-cream-50 py-24">
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
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {f.items.map((item, i) => (
            <FeatureCard
              key={item.title}
              index={i}
              title={item.title}
              body={item.body}
              motionEnabled={!reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
