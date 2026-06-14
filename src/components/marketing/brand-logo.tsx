import { BrandName } from "@/components/brand-name";
import { BrandLogoMark } from "@/components/marketing/brand-logo-mark";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  textClassName?: string;
  markSize?: number;
  showText?: boolean;
};

/** Logotyp: ikon + «HappySent» wordmark. */
export function BrandLogo({
  className,
  textClassName,
  markSize = 28,
  showText = true,
}: BrandLogoProps) {
  const markClass =
    markSize <= 24 ? "h-6 w-6" : markSize <= 28 ? "h-7 w-7" : undefined;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandLogoMark size={markSize} className={markClass} />
      {showText && (
        <BrandName
          size="logo"
          className={cn("text-slate-900", textClassName)}
        />
      )}
    </span>
  );
}
