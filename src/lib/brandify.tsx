import { Fragment, type ReactNode } from "react";

import { BrandName } from "@/components/brand-name";

const BRAND_PATTERN = /(?:HappySent|HappySent)(?:s)?/gi;

function brandDisplay(part: string): string {
  return /s$/i.test(part) ? "HappySents" : "HappySent";
}

/** Byter ut «HappySent» / «HappySents» (även äldre «HappySent») mot BrandName i löptext. */
export function brandify(text: string, brandClassName?: string): ReactNode[] {
  const parts = text.split(BRAND_PATTERN);
  return parts.map((part, index) => {
    if (!part) return null;
    if (/^(?:HappySent|HappySent)/i.test(part)) {
      return (
        <BrandName key={index} className={brandClassName}>
          {brandDisplay(part)}
        </BrandName>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
