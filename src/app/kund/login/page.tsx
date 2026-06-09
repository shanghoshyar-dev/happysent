import Link from "next/link";

import { BrandLogo } from "@/components/marketing/brand-logo";

import { KundLoginForm } from "./kund-login-form";

export const metadata = {
  title: "Kundportal – logga in",
};

interface Props {
  searchParams: { error?: string };
}

export default function KundLoginPage({ searchParams }: Props) {
  const err = searchParams.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-candy-gradient px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-candy-100 bg-white p-10 shadow-soft">
        <Link href="/" className="inline-flex">
          <BrandLogo markSize={28} />
        </Link>
        <h1 className="mt-8 font-display text-3xl text-slate-900">
          Kundportal
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Logga in för att hantera era anställda och födelsedagar.
        </p>
        {err === "no_access" ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Inget kundkonto kopplat till den här adressen. Använd länken i
            inbjudan från HappySent.
          </p>
        ) : null}
        {err === "auth" ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Aktiveringslänken gick ut eller har redan använts. Be HappySent
            skicka en ny inbjudan, eller kontakta oss om du behöver hjälp.
          </p>
        ) : null}
        <div className="mt-8">
          <KundLoginForm />
        </div>
      </div>
    </div>
  );
}
