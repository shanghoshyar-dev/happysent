"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { submitEmployeeRequest, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

function SubmitButton({ action }: { action: "add" | "remove" }) {
  const { pending } = useFormStatus();
  const label = action === "add" ? "Skicka tillägg" : "Skicka borttagning";
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Skickar..." : label}
    </Button>
  );
}

export function EmployeeRequestForm() {
  const [state, formAction] = useFormState(submitEmployeeRequest, initialState);
  const [action, setAction] = useState<"add" | "remove">("add");

  if (state.status === "success") {
    return (
      <div className="space-y-4 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl text-slate-900">Tack!</h2>
        <p className="text-slate-600">
          Vi har tagit emot din förfrågan och uppdaterar listan inom en
          arbetsdag. En bekräftelse är skickad till din mejl.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm"
    >
      <div>
        <h2 className="font-display text-2xl text-slate-900">
          Lägg till eller ta bort anställd
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Är ni redan kund? Skicka in ändringar i personalen här så uppdaterar
          vi listan åt er.
        </p>
      </div>

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
        <div>
          <Label htmlFor="first_name">Anställdas förnamn</Label>
          <Input id="first_name" name="first_name" required />
        </div>
        <div>
          <Label htmlFor="last_name">Anställdas efternamn</Label>
          <Input id="last_name" name="last_name" required />
        </div>
        {action === "add" && (
          <>
            <div>
              <Label htmlFor="birthday">Födelsedag</Label>
              <Input id="birthday" name="birthday" type="date" required />
            </div>
            <div>
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
            </div>
          </>
        )}
      </div>

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

      <div>
        <Label htmlFor="employee-message">Meddelande (valfritt)</Label>
        <Textarea id="employee-message" name="message" rows={3} />
      </div>

      {state.status === "error" && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <SubmitButton action={action} />
    </form>
  );
}
