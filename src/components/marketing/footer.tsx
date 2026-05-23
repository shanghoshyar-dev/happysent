"use client";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { BrandName } from "@/components/brand-name";
import { LocalizedLink } from "@/components/marketing/localized-link";
import { useLocale } from "@/i18n/locale-provider";

export function MarketingFooter() {
  const { messages } = useLocale();

  return (
    <footer className="border-t border-candy-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <BrandLogo markSize={24} />
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
          <LocalizedLink
            href="/integritetspolicy"
            className="hover:text-candy-600"
          >
            {messages.footer.privacy}
          </LocalizedLink>
          <LocalizedLink href="/anvandarvillkor" className="hover:text-candy-600">
            {messages.footer.terms}
          </LocalizedLink>
          <LocalizedLink href="/login" className="hover:text-candy-600">
            {messages.nav.login}
          </LocalizedLink>
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
