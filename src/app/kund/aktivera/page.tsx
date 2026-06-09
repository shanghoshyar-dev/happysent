import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { createClient } from "@/lib/supabase/server";

import { KundAktiveraForm } from "./kund-aktivera-form";

export const metadata = {
  title: "Aktivera kundkonto",
};

export default async function KundAktiveraPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/kund/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-candy-gradient px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-candy-100 bg-white p-10 shadow-soft">
        <Link href="/" className="inline-flex">
          <BrandLogo markSize={28} />
        </Link>
        <h1 className="mt-8 font-display text-3xl text-slate-900">
          Välkommen!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Välj ett lösenord för att aktivera ert konto i kundportalen.
        </p>
        <div className="mt-8">
          <KundAktiveraForm />
        </div>
      </div>
    </div>
  );
}
