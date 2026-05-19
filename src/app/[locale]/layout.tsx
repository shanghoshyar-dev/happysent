import { notFound } from "next/navigation";

import { locales, type Locale, isLocale } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  return children;
}
