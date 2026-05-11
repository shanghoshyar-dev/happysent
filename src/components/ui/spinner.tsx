import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent border-t-transparent opacity-90",
        className,
      )}
      aria-hidden
    />
  );
}
