import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";
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
      <div className="flex min-h-screen min-w-0 flex-col">
        <MarketingNav />
        <main className="min-w-0 flex-1 overflow-x-clip scroll-pt-28">
          {children}
        </main>
        <MarketingFooter />
      </div>
    </LocaleProvider>
  );
}
