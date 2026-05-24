"use client";

import { useEffect, useState } from "react";

import { LocalizedLink } from "@/components/marketing/localized-link";
import { CtaButton } from "@/components/marketing/cta-button";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-provider";
import {
  applyConsentSideEffects,
  COOKIE_CONSENT_OPEN_EVENT,
  getConsent,
  getGaMeasurementId,
  setConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

export function CookieBanner() {
  const { messages } = useLocale();
  const b = messages.cookieBanner;
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getGaMeasurementId()) return;

    setMounted(true);
    setVisible(getConsent() === null);

    const open = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, open);
  }, []);

  const choose = (consent: CookieConsent) => {
    setConsent(consent);
    applyConsentSideEffects(consent);
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-candy-100 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-6"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p
            id="cookie-banner-title"
            className="font-display text-base font-semibold text-slate-900"
          >
            {b.title}
          </p>
          <p id="cookie-banner-desc" className="mt-1 text-sm text-slate-600">
            {b.bodyBefore}{" "}
            <LocalizedLink
              href="/integritetspolicy"
              className="font-medium text-candy-600 hover:underline"
            >
              {b.privacyLink}
            </LocalizedLink>
            {b.bodyAfter}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => choose("necessary")}
          >
            {b.necessaryOnly}
          </Button>
          <CtaButton
            type="button"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => choose("analytics")}
          >
            {b.acceptAll}
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
