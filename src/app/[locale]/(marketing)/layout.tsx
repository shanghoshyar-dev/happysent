import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingPhotoBackground } from "@/components/marketing/marketing-photo-background";
import { CookieBanner } from "@/components/cookie-banner";
import { GoogleAnalytics } from "@/components/google-analytics";
import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import { LocaleProvider } from "@/i18n/locale-provider";
import { notFound } from "next/navigation";

export default function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen min-w-0 flex-col pt-[var(--marketing-nav-offset)]">
        <MarketingNav />
        <main className="relative min-w-0 flex-1 overflow-x-clip scroll-pt-[var(--marketing-nav-offset)]">
          <MarketingPhotoBackground />
          <div className="relative z-10">{children}</div>
        </main>
        <MarketingFooter />
        <CookieBanner />
        <GoogleAnalytics />
      </div>
    </LocaleProvider>
  );
}
