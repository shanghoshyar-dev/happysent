import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-candy-gradient">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-candy-700 shadow-sm">
            <span aria-hidden>✨</span> Ny i Malmö
          </span>
          <h1 className="mt-6 font-display text-5xl leading-tight tracking-tight text-slate-900 md:text-6xl">
            Glöm aldrig en
            <br />
            <span className="text-candy-500">födelsedag</span> igen.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-600">
            Happysent bokar och levererar färska tårtor från lokala bagerier till
            ditt kontor – på rätt dag, varje gång. Lägg till dina anställda,
            luta dig tillbaka och låt oss sköta resten.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/kontakt">
              <Button size="lg">Kom igång</Button>
            </Link>
            <Link href="/priser">
              <Button size="lg" variant="secondary">
                Se priser
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Inga uppstartsavgifter · Pausa när som helst
          </p>
        </div>
        <div className="relative">
          <div className="rotate-2 rounded-3xl bg-white p-8 shadow-soft">
            <div className="flex items-center gap-3 border-b border-candy-100 pb-4">
              <span aria-hidden className="text-3xl">🎂</span>
              <div>
                <p className="font-semibold text-slate-900">Kalle fyller år!</p>
                <p className="text-xs text-slate-500">14 dagar kvar</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex justify-between">
                <span>Bageri</span>
                <span className="font-medium text-slate-900">Söderbergs</span>
              </li>
              <li className="flex justify-between">
                <span>Antal personer</span>
                <span className="font-medium text-slate-900">8</span>
              </li>
              <li className="flex justify-between">
                <span>Leverans</span>
                <span className="font-medium text-slate-900">Tor 09:00</span>
              </li>
              <li className="flex justify-between">
                <span>Status</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  Bokad
                </span>
              </li>
            </ul>
          </div>
          <div className="absolute -bottom-6 -left-6 rotate-[-6deg] rounded-2xl bg-sprinkle-lemon px-4 py-3 text-sm font-medium text-slate-800 shadow">
            Levererad: 47 tårtor i år
          </div>
        </div>
      </div>
    </section>
  );
}
