import Link from "next/link";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav
            aria-label="Du är här"
            className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"
          >
            {breadcrumbs.map((b, i) => (
              <span key={`${b.label}-${i}`} className="flex items-center gap-2">
                {i > 0 ? <span aria-hidden>/</span> : null}
                {b.href ? (
                  <Link
                    href={b.href}
                    className="font-medium text-coral-600 transition-colors hover:text-coral-700 hover:underline"
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="font-display text-3xl text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
    </div>
  );
}
