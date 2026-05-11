import Link from "next/link";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/om-oss", label: "Om oss" },
  { href: "/hur-det-fungerar", label: "Hur det fungerar" },
  { href: "/priser", label: "Priser" },
  { href: "/blogg", label: "Blogg" },
  { href: "/kontakt", label: "Kontakt" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-candy-100/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">🎂</span>
          <span className="font-display text-xl font-semibold text-slate-900">
            Happysent
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-candy-600"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-600 hover:text-candy-600 sm:inline"
          >
            Logga in
          </Link>
          <Link href="/kontakt">
            <Button size="sm">Kom igång</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
