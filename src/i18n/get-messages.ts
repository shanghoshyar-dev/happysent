import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/messages/en";
import { sv, type Messages } from "@/i18n/messages/sv";

export function getMessages(locale: Locale): Messages {
  return locale === "en" ? en : sv;
}
