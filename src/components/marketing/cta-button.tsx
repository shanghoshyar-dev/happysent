import { forwardRef, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BaseButtonProps = ComponentProps<typeof Button>;

const decorSize: Record<NonNullable<BaseButtonProps["size"]>, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

/** Emojis ska ligga delvis ovanpå knappens rundade kanter. */
const decorOverlap: Record<
  NonNullable<BaseButtonProps["size"]>,
  { cake: string; flower: string; buttonPad: string }
> = {
  sm: {
    cake: "-mr-2.5",
    flower: "-ml-2.5",
    buttonPad: "!px-7",
  },
  md: {
    cake: "-mr-3",
    flower: "-ml-3",
    buttonPad: "!px-8",
  },
  lg: {
    cake: "-mr-4",
    flower: "-ml-4",
    buttonPad: "!px-10",
  },
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
    const overlap = decorOverlap[resolvedSize];

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          fullWidth && "w-full",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "cta-decor cta-decor--cake relative z-10 shrink-0 select-none",
            decorSize[resolvedSize],
            overlap.cake,
          )}
        >
          🎂
        </span>
        <Button
          ref={ref}
          size={resolvedSize}
          className={cn(
            "relative z-0",
            overlap.buttonPad,
            fullWidth && "min-w-0 flex-1",
            className,
          )}
          {...props}
        >
          {children}
        </Button>
        <span
          aria-hidden
          className={cn(
            "cta-decor cta-decor--flower relative z-10 shrink-0 select-none",
            decorSize[resolvedSize],
            overlap.flower,
          )}
        >
          💐
        </span>
      </span>
    );
  },
);
