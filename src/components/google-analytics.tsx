"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  getGaMeasurementId,
  hasAnalyticsConsent,
  isAnalyticsPath,
} from "@/lib/cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function sendPageView(measurementId: string, path: string): void {
  if (!window.gtag) return;
  window.gtag("config", measurementId, { page_path: path });
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = getGaMeasurementId();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    const sync = () => {
      setEnabled(hasAnalyticsConsent());
    };

    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || !enabled || !pathname || !isAnalyticsPath(pathname)) {
      return;
    }

    let cancelled = false;
    const trySend = (attempt = 0) => {
      if (cancelled) return;
      if (window.gtag) {
        sendPageView(measurementId, pathname);
        return;
      }
      if (attempt < 20) {
        window.setTimeout(() => trySend(attempt + 1), 50);
      }
    };
    trySend();

    return () => {
      cancelled = true;
    };
  }, [measurementId, enabled, pathname]);

  if (!measurementId || !enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('consent', 'update', { analytics_storage: 'granted' });
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
