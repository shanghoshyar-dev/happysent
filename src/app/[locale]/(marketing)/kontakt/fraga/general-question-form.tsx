"use client";

import { useFormState, useFormStatus } from "react-dom";

import { HoneypotField } from "@/components/marketing/honeypot-field";
import { useLocale } from "@/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { submitGeneralQuestion, type GeneralQuestionState } from "./actions";

const initialState: GeneralQuestionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  const { messages } = useLocale();
  const f = messages.forms.generalQuestion;
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner />
          {f.sending}
        </span>
      ) : (
        f.submit
      )}
    </Button>
  );
}

function errorText(
  message: string,
  f: {
    fillRequired: string;
    invalidEmail: string;
    invalidPhone: string;
    sendFailed: string;
  },
): string {
  if (message === "fillRequired") return f.fillRequired;
  if (message === "invalidEmail") return f.invalidEmail;
  if (message === "invalidPhone") return f.invalidPhone;
  if (message === "sendFailed") return f.sendFailed;
  return message;
}

export function GeneralQuestionForm({ className }: { className?: string }) {
  const [state, formAction] = useFormState(submitGeneralQuestion, initialState);
  const { messages } = useLocale();
  const f = messages.forms.generalQuestion;

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
          className,
        )}
      >
        <h2 className="font-display text-2xl text-slate-900">{f.successTitle}</h2>
        <p className="mt-3 text-slate-600">{f.successBody}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn(
        "relative rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
        className,
      )}
    >
      <HoneypotField />
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="first_name">{f.firstName}</Label>
            <Input
              id="first_name"
              name="first_name"
              required
              autoComplete="given-name"
            />
          </div>
          <div>
            <Label htmlFor="last_name">{f.lastName}</Label>
            <Input
              id="last_name"
              name="last_name"
              required
              autoComplete="family-name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">{f.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="phone">{f.phone}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
          />
        </div>
        <div>
          <Label htmlFor="message">{f.message}</Label>
          <Textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder={f.messagePlaceholder}
          />
        </div>
        {state.status === "error" && (
          <p className="text-sm text-red-600" role="alert">
            {errorText(state.message, f)}
          </p>
        )}
        <SubmitButton />
      </div>
    </form>
  );
}
