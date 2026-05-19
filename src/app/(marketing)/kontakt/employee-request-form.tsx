"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
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
  const base = action === "add" ? "Skicka tillägg" : "Skicka borttagning";
  const label =
    rowCount > 1 ? `${base} (${rowCount} personer)` : base;
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner />
          Skickar…
        </span>
      ) : (
        label
      )}
    </Button>
  );
}

export function EmployeeRequestForm({ className }: { className?: string }) {
  const [state, formAction] = useFormState(submitEmployeeRequest, initialState);
  const [action, setAction] = useState<"add" | "remove">("add");
  const [rowKeys, setRowKeys] = useState<string[]>(() => ["0"]);

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "flex flex-col space-y-4 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
          className,
        )}
      >
        <h2 className="font-display text-2xl text-slate-900">Tack!</h2>
        <p className="text-slate-600">
          Vi har tagit emot din förfrågan och uppdaterar listan inom en
          arbetsdag. En bekräftelse är skickad till din mejl. Om vi känner igen
          ert företag i systemet får ni även en sammanfattning till företagets
          registrerade kontaktmejl vid nästa planerade utskick (vanligtvis
          följande vardagsmorgon).
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-5 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
        className,
      )}
    >
      <div className="shrink-0">
        <h2 className="font-display text-2xl text-slate-900">
          Lägg till eller ta bort anställd
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Är ni redan kund? Skicka in ändringar i personalen här så uppdaterar
          vi listan åt er. Ni kan ange <strong>flera personer i samma formulär</strong>.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div>
          <Label htmlFor="action_type">Åtgärd</Label>
          <Select
            id="action_type"
            name="action_type"
            value={action}
            onChange={(e) => setAction(e.target.value as "add" | "remove")}
            required
          >
            <option value="add">Lägg till</option>
            <option value="remove">Ta bort</option>
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="company_name">Företagsnamn</Label>
            <Input id="company_name" name="company_name" required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Adress</Label>
            <Input id="address" name="address" required />
          </div>
          <div>
            <Label htmlFor="postal_code">Postnummer</Label>
            <Input
              id="postal_code"
              name="postal_code"
              required
              autoComplete="postal-code"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label htmlFor="city">Ort</Label>
            <Input id="city" name="city" required autoComplete="address-level2" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm font-medium text-slate-800">Anställda</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setRowKeys((keys) => [...keys, `${Date.now()}-${keys.length}`])
                }
              >
                + Lägg till rad
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
                Ta bort sista raden
              </Button>
            </div>
          </div>

          {rowKeys.map((key, index) => (
            <div
              key={key}
              className="grid gap-4 rounded-2xl border border-candy-100 bg-candy-50/40 p-4 sm:grid-cols-2"
            >
              <p className="sm:col-span-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Person {index + 1}
              </p>
              <div>
                <Label htmlFor={`emp_first_${key}`}>Förnamn</Label>
                <Input
                  id={`emp_first_${key}`}
                  name="emp_first_name"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <Label htmlFor={`emp_last_${key}`}>Efternamn</Label>
                <Input
                  id={`emp_last_${key}`}
                  name="emp_last_name"
                  required
                  autoComplete="family-name"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`emp_birth_${key}`}>Födelsedatum</Label>
                <Input
                  id={`emp_birth_${key}`}
                  name="emp_birthday"
                  type="date"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Ett datum per person. Vi behöver inte hela personnumret.
                </p>
              </div>
            </div>
          ))}
        </div>

        {action === "add" && (
          <div className="max-w-md">
            <Label htmlFor="number_of_people">
              Antal personer på avdelningen
            </Label>
            <Input
              id="number_of_people"
              name="number_of_people"
              type="number"
              min={1}
              defaultValue={10}
              required
              inputMode="numeric"
            />
            <p className="mt-1 text-xs text-slate-500">
              Gäller er avdelning som helhet (samma värde för alla som läggs till
              i detta ärende).
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="submitted_by_email">Din mejl (för bekräftelse)</Label>
          <Input
            id="submitted_by_email"
            name="submitted_by_email"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Label htmlFor="employee-message">Meddelande (valfritt)</Label>
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
