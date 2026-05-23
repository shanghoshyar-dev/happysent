import { Download } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  className?: string;
};

export function ExcelTemplateDownload({ label, className }: Props) {
  return (
    <a
      href="/happysent-mall.xlsx"
      download
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-forest-300 bg-white px-5 py-2.5 text-sm font-semibold text-forest-800 shadow-sm ring-1 ring-white/80 transition-all hover:border-forest-400 hover:bg-forest-50 hover:shadow-md active:scale-[0.98]",
        className,
      )}
    >
      <Download className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </a>
  );
}
