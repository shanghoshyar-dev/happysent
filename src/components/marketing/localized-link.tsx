"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { useLocale } from "@/i18n/locale-provider";
import { localizedPath } from "@/i18n/routing";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Marketing link that keeps the current locale in the URL. */
export function LocalizedLink({ href, ...props }: Props) {
  const { locale } = useLocale();
  return <Link href={localizedPath(href, locale)} {...props} />;
}
