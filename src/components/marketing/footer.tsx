"use client";

import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { BrandName } from "@/components/brand-name";
import { LocalizedLink } from "@/components/marketing/localized-link";
import { useLocale } from "@/i18n/locale-provider";
import { getGaMeasurementId, openCookieSettings } from "@/lib/cookie-consent";

export function MarketingFooter() {
  const { messages } = useLocale();
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  useEffect(() => {
    setShowCookieSettings(Boolean(getGaMeasurementId()));
  }, []);

  return (
    <footer className="relative z-20 shrink-0 border-t border-candy-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <BrandLogo markSize={24} className="shrink-0" />
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <LocalizedLink href="/om-oss" className="hover:text-candy-600">
            {messages.nav.about}
          </LocalizedLink>
          <LocalizedLink
            href="/hur-det-fungerar"
            className="hover:text-candy-600"
          >
            {messages.nav.howItWorks}
          </LocalizedLink>
          <LocalizedLink href="/priser" className="hover:text-candy-600">
            {messages.nav.pricing}
          </LocalizedLink>
          <LocalizedLink href="/blogg" className="hover:text-candy-600">
            {messages.nav.blog}
          </LocalizedLink>
          <LocalizedLink href="/kontakt" className="hover:text-candy-600">
            {messages.nav.contact}
          </LocalizedLink>
          <a
            href="/marketing/tartkatalog.pdf"
            className="hover:text-candy-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.footer.cakeCatalog}
          </a>
          <LocalizedLink
            href="/integritetspolicy"
            className="hover:text-candy-600"
          >
            {messages.footer.privacy}
          </LocalizedLink>
          <LocalizedLink href="/anvandarvillkor" className="hover:text-candy-600">
            {messages.footer.terms}
          </LocalizedLink>
          {showCookieSettings ? (
            <button
              type="button"
              className="hover:text-candy-600"
              onClick={() => openCookieSettings()}
            >
              {messages.footer.cookieSettings}
            </button>
          ) : null}
        </nav>
        <div className="flex flex-col gap-1 text-right md:text-left">
          <a
            href="mailto:info@happysent.com"
            className="font-medium text-slate-700 hover:text-candy-600"
          >
            info@happysent.com
          </a>
          <p>
            &copy; {new Date().getFullYear()} <BrandName />
          </p>
        </div>
      </div>
    </footer>
  );
}
