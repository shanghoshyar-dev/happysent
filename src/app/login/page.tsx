import Link from "next/link";

import { BrandName } from "@/components/brand-name";
import { BrandCakeIcon } from "@/components/marketing/brand-cake-icon";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Logga in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-candy-gradient px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-candy-100 bg-white p-10 shadow-soft">
        <Link href="/" className="flex items-center gap-2">
          <BrandCakeIcon size={28} className="h-7 w-7" />
          <BrandName size="logo" className="text-slate-900" />
        </Link>
        <h1 className="mt-8 font-display text-3xl text-slate-900">
          Logga in på admin
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Vi mejlar en magisk länk till adressen du anger nedan.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
