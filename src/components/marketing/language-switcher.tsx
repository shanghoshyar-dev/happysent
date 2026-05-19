"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/locale-provider";
import { localizedPath, stripLocalePrefix } from "@/i18n/routing";
import { cn } from "@/lib/utils";

function FlagSweden({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" fill="#006AA7" rx="12" />
      <rect x="7" y="0" width="3" height="24" fill="#FECC00" />
      <rect x="0" y="10" width="24" height="3" fill="#FECC00" />
    </svg>
  );
}

function FlagUk({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" fill="#012169" rx="12" />
      <path
        d="M0 0l24 24M24 0L0 24"
        stroke="#fff"
        strokeWidth="4"
      />
      <path
        d="M0 0l24 24M24 0L0 24"
        stroke="#C8102E"
        strokeWidth="2"
      />
      <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="6" />
      <path d="M12 0v24M0 12h24" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

function FlagButton({
  locale,
  targetLocale,
  label,
  pathname,
  currentLocale,
}: {
  locale: Locale;
  targetLocale: Locale;
  label: string;
  pathname: string;
  currentLocale: Locale;
}) {
  const active = currentLocale === targetLocale;
  const href = localizedPath(pathname, targetLocale);

  return (
    <Link
      href={href}
      hrefLang={targetLocale === "en" ? "en" : "sv"}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-shadow",
        active
          ? "ring-2 ring-slate-300 ring-offset-2 ring-offset-white"
          : "ring-1 ring-slate-200/80 opacity-80 hover:opacity-100",
      )}
    >
      {locale === "sv" ? (
        <FlagSweden className="h-7 w-7 rounded-full" />
      ) : (
        <FlagUk className="h-7 w-7 rounded-full" />
      )}
    </Link>
  );
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, messages } = useLocale();
  const pathname = usePathname();
  const basePath = stripLocalePrefix(pathname);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full bg-slate-900/5 px-1.5 py-1",
        className,
      )}
      role="group"
      aria-label={locale === "sv" ? "Språk" : "Language"}
    >
      <FlagButton
        locale="sv"
        targetLocale="sv"
        label={messages.nav.switchToSv}
        pathname={basePath}
        currentLocale={locale}
      />
      <FlagButton
        locale="en"
        targetLocale="en"
        label={messages.nav.switchToEn}
        pathname={basePath}
        currentLocale={locale}
      />
    </div>
  );
}
