"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { stripLocalePrefix } from "@/i18n/routing";

const EXCLUDED_PATHS = [
  "/om-oss",
  "/integritetspolicy",
  "/anvandarvillkor",
] as const;

export function MarketingPhotoBackground() {
  const pathname = usePathname();
  const basePath = stripLocalePrefix(pathname);

  if (EXCLUDED_PATHS.includes(basePath as (typeof EXCLUDED_PATHS)[number])) {
    return null;
  }

  const isHome = basePath === "/";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <Image
        src="/marketing/hero-cakes-flowers.avif"
        alt=""
        fill
        className="object-cover object-[center_42%]"
        sizes="100vw"
        priority={isHome}
      />
      <div className="absolute inset-0 bg-[#2c1f1a]/42" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2c1f1a]/22 via-[#2c1f1a]/32 to-[#2c1f1a]/52" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_42%,rgba(20,12,10,0.58)_0%,rgba(20,12,10,0.22)_55%,transparent_78%)]" />
      <div className="marketing-photo-slats absolute inset-0" />
    </div>
  );
}
