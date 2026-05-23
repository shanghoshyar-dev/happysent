"use client";

import { useEffect, useMemo, useState } from "react";

import { useLocale } from "@/i18n/locale-provider";
import { donationCampaignEndMs } from "@/lib/donation-campaign";
import { formatSek } from "@/lib/utils";

interface Props {
  initialTotalKr: number;
}

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeCountdown(endMs: number): CountdownParts {
  const diff = Math.max(0, endMs - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function DonationCountdown({ initialTotalKr }: Props) {
  const { messages } = useLocale();
  const d = messages.donationCountdown;
  const endMs = useMemo(() => donationCampaignEndMs(), []);
  const [totalKr, setTotalKr] = useState(initialTotalKr);
  const [parts, setParts] = useState<CountdownParts>(() =>
    computeCountdown(endMs),
  );

  useEffect(() => {
    setTotalKr(initialTotalKr);
  }, [initialTotalKr]);

  useEffect(() => {
    const tick = () => setParts(computeCountdown(endMs));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endMs]);

  const countdownEnded =
    parts.days === 0 &&
    parts.hours === 0 &&
    parts.minutes === 0 &&
    parts.seconds === 0;

  return (
    <section className="bg-cream-50 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl border border-candy-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-candy-600">
            {d.eyebrow}
          </p>
          <h2 className="mt-3 text-center font-display text-3xl text-slate-900 md:text-4xl">
            {d.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            {d.intro}
          </p>

          <div className="mt-10 rounded-2xl bg-candy-500 px-6 py-8 text-center text-white shadow-soft">
            <p className="text-sm font-medium text-candy-50/90">{d.fundLabel}</p>
            <p className="mt-2 font-display text-5xl md:text-6xl">
              {formatSek(totalKr)}
            </p>
            <p className="mt-3 text-sm text-candy-50/90">{d.perDelivery}</p>
          </div>

          <div className="mt-10">
            <p className="text-center text-sm font-semibold text-slate-700">
              {countdownEnded ? d.countdownEnded : d.countdownLabel}
            </p>
            {!countdownEnded && (
              <div
                className="mt-4 grid grid-cols-4 gap-3 sm:gap-4"
                role="timer"
                aria-live="polite"
              >
                {(
                  [
                    ["days", parts.days, d.days],
                    ["hours", parts.hours, d.hours],
                    ["minutes", parts.minutes, d.minutes],
                    ["seconds", parts.seconds, d.seconds],
                  ] as const
                ).map(([key, value, label]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-candy-100 bg-cream-50 px-2 py-4 text-center sm:px-4"
                  >
                    <span className="font-display text-3xl text-slate-900 sm:text-4xl">
                      {pad(value)}
                    </span>
                    <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-slate-600">
            {d.lottery}
          </p>

          <div className="mt-10">
            <h3 className="text-center font-display text-xl text-slate-900">
              {d.participantsTitle}
            </h3>
            <ul className="mx-auto mt-4 grid max-w-xl gap-2 sm:grid-cols-2">
              {d.participants.map((name) => (
                <li
                  key={name}
                  className="rounded-xl border border-candy-100 bg-cream-50 px-4 py-3 text-center text-sm font-medium text-slate-800"
                >
                  {name}
                </li>
              ))}
            </ul>
            <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-600">
              {d.joinBefore}{" "}
              <a
                href="mailto:info@happysent.com"
                className="font-medium text-candy-600 hover:underline"
              >
                info@happysent.com
              </a>{" "}
              {d.joinAfter}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
