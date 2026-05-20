import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandCakeIconProps = {
  className?: string;
  size?: number;
};

/** Tårt-ikon från logotypen (samma som i nav). */
export function BrandCakeIcon({
  className,
  size = 32,
}: BrandCakeIconProps) {
  return (
    <Image
      src="/marketing/brand-cake.png"
      alt=""
      width={size}
      height={size}
      className={cn("object-contain", className)}
      aria-hidden
    />
  );
}
