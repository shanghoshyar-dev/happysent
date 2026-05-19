"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { CreateCompanyResult } from "./actions";
import { CompanyForm, type CompanyFormProps } from "./company-form";

type Props = Omit<CompanyFormProps, "action"> & {
  saveAction: (formData: FormData) => Promise<CreateCompanyResult>;
};

export function CreateCompanyForm({ saveAction, ...formProps }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/foretag");
      router.refresh();
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
