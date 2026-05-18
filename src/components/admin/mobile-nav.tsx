"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Översikt", icon: "📊" },
  { href: "/admin/kolista", label: "Kölista", icon: "📋" },
  { href: "/admin/foretag", label: "Företag", icon: "🏢" },
  { href: "/admin/anstallda", label: "Anställda", icon: "🎂" },
  { href: "/admin/bagerier", label: "Bagerier", icon: "🥐" },
  { href: "/admin/bestallningar", label: "Beställningar", icon: "📦" },
  { href: "/admin/fakturor", label: "Fakturor", icon: "💳" },
  { href: "/admin/produkter", label: "Produkter", icon: "🧁" },
  { href: "/admin/blogg", label: "Blogg", icon: "📝" },
  { href: "/admin/settings", label: "Inställningar", icon: "⚙️" },
];

export function MobileAdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Meny
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20"
            aria-label="Stäng meny"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
            {items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-coral-50 text-coral-800"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </>
      ) : null}
    </div>
  );
}
