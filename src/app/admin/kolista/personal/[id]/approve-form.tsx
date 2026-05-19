"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import { approveEmployeeChangeRequest } from "../../actions";

interface Props {
  requestId: string;
  companies: { id: string; name: string; city: string }[];
  suggestedCompanyId: string | null;
}

export function ApproveEmployeeChangeForm({
  requestId,
  companies,
  suggestedCompanyId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState(
    suggestedCompanyId ?? companies[0]?.id ?? "",
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await approveEmployeeChangeRequest(requestId, companyId);
          if (!res.ok) {
            setError(res.error ?? "Kunde inte godkänna.");
            return;
          }
          router.push("/admin/kolista");
          router.refresh();
        });
      }}
    >
      <div>
        <Label htmlFor="company_id">Företag i systemet</Label>
        <Select
          id="company_id"
          name="company_id"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="" disabled>
            Välj företag…
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.city})
            </option>
          ))}
        </Select>
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending || !companyId}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Godkänner…
          </span>
        ) : (
          "Godkänn och uppdatera personal"
        )}
      </Button>
    </form>
  );
}
