"use client";

import { useFormState, useFormStatus } from "react-dom";

import { BrandName } from "@/components/brand-name";
import { LocalizedLink } from "@/components/marketing/localized-link";
import { useLocale } from "@/i18n/locale-provider";
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
  const { messages } = useLocale();
  const f = messages.forms.contact;
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

export function ContactForm({ className }: { className?: string }) {
  const [state, formAction] = useFormState(submitContactForm, initialState);
  const { messages } = useLocale();
  const f = messages.forms.contact;

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
      encType="multipart/form-data"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-5 rounded-3xl border border-candy-100 bg-white p-8 shadow-sm",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div>
          <Label htmlFor="name">{f.name}</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="company">{f.company}</Label>
          <Input id="company" name="company" required />
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
            inputMode="tel"
            placeholder="t.ex. 070-123 45 67"
          />
          <p className="mt-1 text-xs text-slate-500">{f.phoneHint}</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Label htmlFor="message">{f.message}</Label>
          <Textarea
            id="message"
            name="message"
            placeholder={f.messagePlaceholder}
            rows={5}
            className="min-h-[8rem] flex-1 resize-y xl:min-h-0"
          />
        </div>
        <div>
          <Label htmlFor="employees_xlsx">{f.employeesFile}</Label>
          <Input
            id="employees_xlsx"
            name="employees_xlsx"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-candy-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-candy-800 hover:file:bg-candy-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            {f.employeesHintBefore}{" "}
            <a
              href="/happysent-mall.xlsx"
              className="font-medium text-candy-600 hover:underline"
            >
              <BrandName />
              {f.templateSuffix}
            </a>
            {f.employeesHintAfter}
          </p>
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-candy-600 focus:ring-candy-500"
          />
          <span>
            {f.consentBefore} <BrandName>Happysents</BrandName>{" "}
            <LocalizedLink
              href="/integritetspolicy"
              className="font-medium text-candy-600 hover:underline"
            >
              {f.consentPrivacy}
            </LocalizedLink>{" "}
            {f.consentAfter}
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
            {f.termsBefore} <BrandName>Happysents</BrandName>{" "}
            <LocalizedLink
              href="/anvandarvillkor"
              className="font-medium text-candy-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {f.termsLink}
            </LocalizedLink>
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
