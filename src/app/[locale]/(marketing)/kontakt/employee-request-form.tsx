"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { trackGaEvent } from "@/components/google-analytics";
import { HoneypotField } from "@/components/marketing/honeypot-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

import { submitEmployeeRequest, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

function SubmitButton({
  action,
  rowCount,
}: {
  action: "add" | "remove";
  rowCount: number;
}) {
  const { pending } = useFormStatus();
  const { messages } = useLocale();
  const f = messages.forms.employee;
  const base = action === "add" ? f.submitAdd : f.submitRemove;
  const label =
    rowCount > 1 ? `${base}${f.submitCountSuffix.replace("{count}", String(rowCount))}` : base;
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner />
          {f.sending}
        </span>
      ) : (
        label
      )}
    </Button>
  );
}

export function EmployeeRequestForm({ className }: { className?: string }) {
  const { messages } = useLocale();
  const f = messages.forms.employee;
  const [state, formAction] = useFormState(submitEmployeeRequest, initialState);
  const [action, setAction] = useState<"add" | "remove">("add");
  const [rowKeys, setRowKeys] = useState<string[]>(() => ["0"]);

  useEffect(() => {
    if (state.status === "success") {
      trackGaEvent("generate_lead", { form_name: "employee_request" });
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "flex flex-col space-y-4 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
          className,
        )}
      >
        <h2 className="font-display text-2xl text-slate-900">{f.successTitle}</h2>
        <p className="text-slate-600">{f.successBody}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col gap-5 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
        className,
      )}
    >
      <HoneypotField />
      <div className="shrink-0">
        <h2 className="font-display text-2xl text-slate-900">{f.title}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {f.introBefore}
          <strong>{f.introBold}</strong>
          {f.introAfter}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div>
          <Label htmlFor="action_type">{f.actionLabel}</Label>
          <Select
            id="action_type"
            name="action_type"
            value={action}
            onChange={(e) => setAction(e.target.value as "add" | "remove")}
            required
          >
            <option value="add">{f.actionAdd}</option>
            <option value="remove">{f.actionRemove}</option>
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="company_name">{f.companyName}</Label>
            <Input id="company_name" name="company_name" required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">{f.address}</Label>
            <Input id="address" name="address" required />
          </div>
          <div>
            <Label htmlFor="postal_code">{f.postalCode}</Label>
            <Input
              id="postal_code"
              name="postal_code"
              required
              autoComplete="postal-code"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label htmlFor="city">{f.city}</Label>
            <Input id="city" name="city" required autoComplete="address-level2" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm font-medium text-slate-800">{f.employeesHeading}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setRowKeys((keys) => [...keys, `${Date.now()}-${keys.length}`])
                }
              >
                {f.addRow}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={rowKeys.length <= 1}
                onClick={() =>
                  setRowKeys((keys) =>
                    keys.length <= 1 ? keys : keys.slice(0, -1),
                  )
                }
              >
                {f.removeLastRow}
              </Button>
            </div>
          </div>

          {rowKeys.map((key, index) => (
            <div
              key={key}
              className="grid gap-4 rounded-2xl border border-candy-100 bg-candy-50/40 p-4 sm:grid-cols-2"
            >
              <p className="sm:col-span-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                {f.personLabel.replace("{n}", String(index + 1))}
              </p>
              <div>
                <Label htmlFor={`emp_first_${key}`}>{f.firstName}</Label>
                <Input
                  id={`emp_first_${key}`}
                  name="emp_first_name"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <Label htmlFor={`emp_last_${key}`}>{f.lastName}</Label>
                <Input
                  id={`emp_last_${key}`}
                  name="emp_last_name"
                  required
                  autoComplete="family-name"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`emp_birth_${key}`}>{f.birthdate}</Label>
                <Input
                  id={`emp_birth_${key}`}
                  name="emp_birthday"
                  type="date"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">{f.birthdateHint}</p>
              </div>
            </div>
          ))}
        </div>

        {action === "add" && (
          <div className="max-w-md">
            <Label htmlFor="number_of_people">{f.deptSizeLabel}</Label>
            <Input
              id="number_of_people"
              name="number_of_people"
              type="number"
              min={1}
              defaultValue={10}
              required
              inputMode="numeric"
            />
            <p className="mt-1 text-xs text-slate-500">{f.deptSizeHint}</p>
          </div>
        )}

        <div>
          <Label htmlFor="submitted_by_email">{f.confirmationEmail}</Label>
          <Input
            id="submitted_by_email"
            name="submitted_by_email"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Label htmlFor="employee-message">{f.messageOptional}</Label>
          <Textarea
            id="employee-message"
            name="message"
            rows={3}
            className="min-h-[5rem] flex-1 resize-y xl:min-h-0"
          />
        </div>
      </div>

      {state.status === "error" && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <SubmitButton action={action} rowCount={rowKeys.length} />
    </form>
  );
}
