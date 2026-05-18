"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { submitContactForm, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner />
          Skickar…
        </span>
      ) : (
        "Skicka"
      )}
    </Button>
  );
}

export function ContactForm({ className }: { className?: string }) {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "flex flex-col space-y-4 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
          className,
        )}
      >
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
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-5 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5">
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
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Label htmlFor="message">Meddelande</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Berätta lite om ert team..."
            rows={5}
            className="min-h-[8rem] flex-1 resize-y xl:min-h-0"
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
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            name="terms_accept"
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-candy-600 focus:ring-candy-500"
          />
          <span>
            Jag har läst och godkänner Happysents{" "}
            <Link
              href="/anvandarvillkor"
              className="font-medium text-candy-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              användarvillkor (Terms and Conditions)
            </Link>
            .
          </span>
        </label>
      </div>
      {state.status === "error" && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
