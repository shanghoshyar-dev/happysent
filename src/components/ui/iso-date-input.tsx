"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";

import { formatIsoDateInput } from "@/lib/dates/iso-date";

import { Input } from "./input";

type IsoDateInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "pattern" | "maxLength" | "placeholder"
>;

export const IsoDateInput = forwardRef<HTMLInputElement, IsoDateInputProps>(
  function IsoDateInput({ defaultValue, onChange, ...props }, ref) {
    const [value, setValue] = useState(() =>
      formatIsoDateInput(String(defaultValue ?? "")),
    );

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder="ÅÅÅÅ-MM-DD"
        pattern="\d{4}-\d{2}-\d{2}"
        maxLength={10}
        value={value}
        onChange={(event) => {
          const formatted = formatIsoDateInput(event.target.value);
          setValue(formatted);
          event.target.value = formatted;
          onChange?.(event);
        }}
      />
    );
  },
);
