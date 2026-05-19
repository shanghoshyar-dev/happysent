import { Fragment, type ReactNode } from "react";

import { BrandName } from "@/components/brand-name";

const BRAND_PATTERN = /(Happysent(?:s)?)/gi;

/** Byter ut «Happysent» / «Happysents» mot BrandName i löptext. */
export function brandify(text: string, brandClassName?: string): ReactNode[] {
  const parts = text.split(BRAND_PATTERN);
  return parts.map((part, index) => {
    if (!part) return null;
    if (/^Happysent/i.test(part)) {
      return (
        <BrandName key={index} className={brandClassName}>
          {part}
        </BrandName>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
