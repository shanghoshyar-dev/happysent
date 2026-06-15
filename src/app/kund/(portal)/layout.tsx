import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/login/actions";
import { BrandLogo } from "@/components/marketing/brand-logo";
import { getCompanySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function KundPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCompanySession();
  if (!session) {
    redirect("/kund/login");
  }

  async function logout() {
    "use server";
    await signOutAction();
    redirect("/kund/login");
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-candy-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/kund">
              <BrandLogo markSize={24} />
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <Link href="/kund" className="hover:text-coral-600">
                Översikt
              </Link>
              <Link href="/kund/anstallda" className="hover:text-coral-600">
                Anställda
              </Link>
              <Link href="/kund/tartor" className="hover:text-coral-600">
                Tårtor
              </Link>
              <Link href="/kund/donation" className="hover:text-coral-600">
                Donation
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>{session.companyName}</span>
            <form action={logout}>
              <button
                type="submit"
                className="font-medium text-coral-600 hover:underline"
              >
                Logga ut
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
