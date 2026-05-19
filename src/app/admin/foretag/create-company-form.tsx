"use client";

import { useState, useTransition } from "react";

import { isNextNavigationError } from "@/lib/next-navigation-errors";

import { CompanyForm, type CompanyFormProps } from "./company-form";

type Props = Omit<CompanyFormProps, "action"> & {
  saveAction: (formData: FormData) => Promise<void>;
};

export function CreateCompanyForm({ saveAction, ...formProps }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveAction(formData);
      } catch (err) {
        if (isNextNavigationError(err)) throw err;
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <CompanyForm
        {...formProps}
        action={action}
        submitLabel={
          pending ? "Sparar…" : (formProps.submitLabel ?? "Spara företag")
        }
      />
    </div>
  );
}
