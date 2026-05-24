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

function grantAnalyticsConsent(measurementId: string): void {
  if (!window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("config", measurementId, { send_page_view: false });
}

function sendPageView(measurementId: string, path: string): void {
  if (!window.gtag || !hasAnalyticsConsent()) return;
  window.gtag("event", "page_view", {
    page_path: path,
    send_to: measurementId,
  });
}

export function trackGaEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!getGaMeasurementId() || !hasAnalyticsConsent() || !window.gtag) return;
  window.gtag("event", name, params);
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = getGaMeasurementId();
  const [ready, setReady] = useState(false);
  const [analyticsGranted, setAnalyticsGranted] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    const check = () => {
      if (typeof window.gtag === "function") {
        setReady(true);
      }
    };
    check();
    const timer = window.setInterval(check, 50);
    return () => window.clearInterval(timer);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId) return;

    const sync = () => {
      const granted = hasAnalyticsConsent();
      setAnalyticsGranted(granted);
      if (granted && window.gtag) {
        grantAnalyticsConsent(measurementId);
      }
    };

    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
  }, [measurementId, ready]);

  useEffect(() => {
    if (
      !measurementId ||
      !ready ||
      !analyticsGranted ||
      !pathname ||
      !isAnalyticsPath(pathname)
    ) {
      return;
    }
    sendPageView(measurementId, pathname);
  }, [measurementId, ready, analyticsGranted, pathname]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <Script id="gtag-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
