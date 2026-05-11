import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-candy-500 text-white shadow-soft transition-all duration-200 ease-out hover:bg-candy-600 hover:-translate-y-0.5 active:translate-y-0 active:bg-candy-700 disabled:hover:translate-y-0",
  secondary:
    "bg-white text-candy-700 border border-candy-200 transition-all duration-200 hover:bg-candy-50 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0",
  ghost:
    "bg-transparent text-candy-700 transition-colors duration-200 hover:bg-candy-50",
  danger:
    "bg-red-600 text-white transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
