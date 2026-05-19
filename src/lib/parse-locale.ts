import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";

export function parseLocaleParam(locale: string): Locale {
  if (!isLocale(locale)) {
    notFound();
  }
  return locale;
}
