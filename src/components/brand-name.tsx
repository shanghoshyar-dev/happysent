import { cn } from "@/lib/utils";

type BrandNameProps = {
  className?: string;
  children?: React.ReactNode;
  /** Större logotyp i nav, footer, login */
  size?: "logo" | "inline";
};

/** Varumärket «Happysent» – Kalam (Daymaker-lik «unforgettable»-stil). */
export function BrandName({
  className,
  children = "Happysent",
  size = "inline",
}: BrandNameProps) {
  return (
    <span
      className={cn(
        "font-script font-normal tracking-tight",
        size === "logo" && "text-xl leading-none sm:text-2xl",
        className,
      )}
    >
      {children}
    </span>
  );
}
