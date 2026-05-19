"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";

import { BrandName } from "@/components/brand-name";
import { CtaButton } from "@/components/marketing/cta-button";

const links = [
  { href: "/om-oss", label: "Om oss" },
  { href: "/hur-det-fungerar", label: "Hur det fungerar" },
  { href: "/priser", label: "Priser" },
  { href: "/blogg", label: "Blogg" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const linkClass = (href: string) =>
    [
      "text-sm font-medium transition-colors",
      pathname === href
        ? "text-candy-600"
        : "text-slate-700 hover:text-candy-600",
    ].join(" ");

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25 },
      };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4 md:py-6">
      <motion.div
        className="pointer-events-auto relative flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-candy-100/80 bg-white/95 px-4 py-2.5 shadow-soft backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sm:px-6 sm:py-3"
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 pr-2"
          aria-label="Happysent startsida"
        >
          <motion.span
            aria-hidden
            className="text-2xl leading-none"
            whileHover={reduceMotion ? undefined : { rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            🎂
          </motion.span>
          <BrandName size="logo" className="truncate text-slate-900" />
        </Link>

        <nav
          className="hidden items-center gap-5 lg:flex xl:gap-7"
          aria-label="Huvudnavigation"
        >
          {links.map((item) => (
            <motion.div key={item.href} {...motionProps}>
              <Link href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.div
          className="hidden shrink-0 items-center gap-3 lg:flex"
          {...motionProps}
        >
          <Link href="/login" className={linkClass("/login")}>
            Logga in
          </Link>
          <Link href="/kontakt">
            <CtaButton size="sm">Kom igång</CtaButton>
          </Link>
        </motion.div>

        <motion.button
          type="button"
          className="flex items-center rounded-full p-2 text-slate-800 hover:bg-cream-50 lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="marketing-mobile-menu"
          aria-label={isOpen ? "Stäng meny" : "Öppna meny"}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="marketing-mobile-menu"
            className="pointer-events-auto fixed inset-0 z-40 bg-cream-50 px-6 pt-28 md:hidden"
            initial={reduceMotion ? false : { opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: "100%" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", damping: 28, stiffness: 320 }
            }
          >
            <nav
              className="mx-auto flex max-w-md flex-col gap-1"
              aria-label="Mobilnavigation"
            >
              {links.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 16 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { delay: i * 0.05 + 0.08 }
                  }
                >
                  <Link
                    href={item.href}
                    className="block rounded-2xl px-4 py-3 text-lg font-medium text-slate-900 hover:bg-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="mt-4 space-y-3 border-t border-candy-100 pt-6"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { delay: 0.35 }}
              >
                <Link
                  href="/login"
                  className="block rounded-2xl px-4 py-3 text-lg font-medium text-slate-700 hover:bg-white"
                  onClick={() => setIsOpen(false)}
                >
                  Logga in
                </Link>
                <Link href="/kontakt" onClick={() => setIsOpen(false)}>
                  <CtaButton size="md" fullWidth>
                    Kom igång
                  </CtaButton>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
