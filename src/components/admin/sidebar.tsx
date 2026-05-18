"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-candy-100 bg-white md:block">
      <div className="flex h-16 items-center gap-2 border-b border-candy-100 px-6">
        <span aria-hidden className="text-2xl">🎂</span>
        <span className="font-display text-lg font-semibold text-slate-900">
          Happysent
        </span>
      </div>
      <nav className="space-y-1 p-4">
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-candy-100 text-candy-700"
                  : "text-slate-600 hover:bg-candy-50 hover:text-candy-700",
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
