"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { submitContactForm, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Skickar..." : "Skicka"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div className="space-y-4 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl text-slate-900">
          Tack för ditt meddelande!
        </h2>
        <p className="text-slate-600">
          Vi har skickat en bekräftelse till din inkorg och återkommer inom en
          arbetsdag.
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
        <Label htmlFor="name">Namn</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="company">Företag</Label>
        <Input id="company" name="company" required />
      </div>
      <div>
        <Label htmlFor="email">Mejl</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="message">Meddelande</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Berätta lite om ert team..."
          rows={5}
        />
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 rounded border-slate-300 text-candy-600 focus:ring-candy-500"
        />
        <span>
          Jag godkänner Happysents{" "}
          <Link
            href="/integritetspolicy"
            className="font-medium text-candy-600 hover:underline"
          >
            integritetspolicy
          </Link>{" "}
          och databehandlingsavtal.
        </span>
      </label>
      {state.status === "error" && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
