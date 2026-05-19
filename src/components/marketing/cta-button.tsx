import { forwardRef, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BaseButtonProps = ComponentProps<typeof Button>;

const decorSize: Record<NonNullable<BaseButtonProps["size"]>, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

export interface CtaButtonProps extends BaseButtonProps {
  /** Centrera raden och låt knappen fylla bredd (t.ex. priskort). */
  fullWidth?: boolean;
}

/**
 * Primär CTA med tårta och blomma på sidorna. Endast dekorationerna animeras.
 */
export const CtaButton = forwardRef<HTMLButtonElement, CtaButtonProps>(
  function CtaButton(
    { className, size = "md", fullWidth, children, ...props },
    ref,
  ) {
    const resolvedSize = size ?? "md";

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-1.5 sm:gap-2",
          fullWidth && "w-full",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "cta-decor cta-decor--cake shrink-0 select-none",
            decorSize[resolvedSize],
          )}
        >
          🎂
        </span>
        <Button
          ref={ref}
          size={resolvedSize}
          className={cn(fullWidth && "min-w-0 flex-1", className)}
          {...props}
        >
          {children}
        </Button>
        <span
          aria-hidden
          className={cn(
            "cta-decor cta-decor--flower shrink-0 select-none",
            decorSize[resolvedSize],
          )}
        >
          💐
        </span>
      </span>
    );
  },
);
