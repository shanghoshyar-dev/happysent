import { BrandLogoMark } from "@/components/marketing/brand-logo-mark";

type BrandCakeIconProps = {
  className?: string;
  size?: number;
};

/** @deprecated Använd BrandLogoMark — behålls för bakåtkompatibilitet. */
export function BrandCakeIcon({ className, size = 32 }: BrandCakeIconProps) {
  return <BrandLogoMark className={className} size={size} />;
}
