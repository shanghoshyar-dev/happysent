"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";

import { BrandName } from "@/components/brand-name";
import { BrandCakeIcon } from "@/components/marketing/brand-cake-icon";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { useLocale } from "@/i18n/locale-provider";
import { stripLocalePrefix } from "@/i18n/routing";

const linkHrefs = [
  "/om-oss",
  "/hur-det-fungerar",
  "/priser",
  "/blogg",
  "/kontakt",
] as const;

export function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { messages } = useLocale();
  const basePath = stripLocalePrefix(pathname);

  const navLabels = [
    messages.nav.about,
    messages.nav.howItWorks,
    messages.nav.pricing,
    messages.nav.blog,
    messages.nav.contact,
  ];

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
      basePath === href
        ? "text-candy-600"
        : "text-slate-700 hover:text-candy-600",
    ].join(" ");

  /** Avoid opacity:0 on mount — can stick invisible (clickable) on locale change / hidden lg: children. */
  const linkMotionProps = reduceMotion
    ? {}
    : {
        initial: { y: -4 },
        animate: { y: 0 },
        transition: { duration: 0.2 },
      };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4 md:py-6">
      <motion.div
        className="pointer-events-auto relative flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border border-candy-100/80 bg-white/95 px-3 py-2.5 opacity-100 shadow-soft backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sm:gap-3 sm:px-5 sm:py-3 lg:px-6"
        initial={false}
      >
        <LocalizedLink
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 pr-1 sm:pr-2"
          aria-label={messages.nav.homeAria}
        >
          <motion.span
            aria-hidden
            className="flex shrink-0 leading-none"
            whileHover={reduceMotion ? undefined : { rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <BrandCakeIcon size={28} className="h-7 w-7" />
          </motion.span>
          <BrandName size="logo" className="truncate text-slate-900" />
        </LocalizedLink>

        <nav
          className="hidden items-center gap-4 lg:flex xl:gap-6"
          aria-label={messages.nav.mainAria}
        >
          {linkHrefs.map((href, i) => (
            <motion.div key={href} {...linkMotionProps}>
              <LocalizedLink href={href} className={linkClass(href)}>
                {navLabels[i]}
              </LocalizedLink>
            </motion.div>
          ))}
        </nav>

        <motion.div
          className="hidden shrink-0 items-center gap-2 opacity-100 lg:flex xl:gap-3"
          {...linkMotionProps}
        >
          <LanguageSwitcher />
          <Link href="/login" className={linkClass("/login")}>
            {messages.nav.login}
          </Link>
          <LocalizedLink href="/kontakt">
            <CtaButton size="sm">{messages.nav.getStarted}</CtaButton>
          </LocalizedLink>
        </motion.div>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <motion.button
            type="button"
            className="flex items-center rounded-full p-2 text-slate-800 hover:bg-cream-50"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="marketing-mobile-menu"
            aria-label={isOpen ? messages.nav.closeMenu : messages.nav.openMenu}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="marketing-mobile-menu"
            className="pointer-events-auto fixed inset-0 z-40 bg-cream-50 px-6 pt-28 md:hidden"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: "100%" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", damping: 28, stiffness: 320 }
            }
          >
            <nav
              className="mx-auto flex max-w-md flex-col gap-1"
              aria-label={messages.nav.mobileAria}
            >
              {linkHrefs.map((href, i) => (
                <motion.div
                  key={href}
                  initial={reduceMotion ? false : { x: 16 }}
                  animate={{ x: 0 }}
                  exit={reduceMotion ? undefined : { x: 16 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { delay: i * 0.05 + 0.08 }
                  }
                >
                  <LocalizedLink
                    href={href}
                    className="block rounded-2xl px-4 py-3 text-lg font-medium text-slate-900 hover:bg-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {navLabels[i]}
                  </LocalizedLink>
                </motion.div>
              ))}

              <motion.div
                className="mt-4 space-y-3 border-t border-candy-100 pt-6"
                initial={reduceMotion ? false : { y: 8 }}
                animate={{ y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { delay: 0.35 }}
              >
                <Link
                  href="/login"
                  className="block rounded-2xl px-4 py-3 text-lg font-medium text-slate-700 hover:bg-white"
                  onClick={() => setIsOpen(false)}
                >
                  {messages.nav.login}
                </Link>
                <LocalizedLink href="/kontakt" onClick={() => setIsOpen(false)}>
                  <CtaButton size="md" fullWidth>
                    {messages.nav.getStarted}
                  </CtaButton>
                </LocalizedLink>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
