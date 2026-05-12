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
    <header className="sticky top-0 z-30 border-b border-candy-100/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="text-2xl">
            🎂
          </span>
          <span className="truncate font-display text-xl font-semibold text-slate-900">
            Happysent
          </span>
        </Link>
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Huvudnavigation"
        >
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
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
      <nav
        className="border-t border-candy-100/60 md:hidden"
        aria-label="Snabblänkar"
      >
        <div className="scrollbar-none mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-full bg-cream-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-candy-100/80 hover:bg-candy-50 hover:text-candy-700"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
