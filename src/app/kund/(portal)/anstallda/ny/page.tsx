import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCompanySession } from "@/lib/auth/session";
import { getCakePricesForForms } from "@/lib/pricing/get-cake-prices-for-forms";

import { EmployeeForm } from "@/app/admin/anstallda/employee-form";

import { createKundEmployee } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function KundNyAnstalldPage() {
  const session = await getCompanySession();
  if (!session) redirect("/kund/login");

  const companies = [{ id: session.companyId, name: session.companyName }];
  const cakePrices = await getCakePricesForForms();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-slate-900">Ny anställd</h1>
        <Link href="/kund/anstallda">
          <Button variant="secondary">Tillbaka</Button>
        </Link>
      </div>
      <Card className="max-w-3xl p-6">
        <EmployeeForm
          companies={companies}
          cakePrices={cakePrices}
          defaultCompanyId={session.companyId}
          hideCompanySelect
          action={createKundEmployee}
          submitLabel="Lägg till"
        />
      </Card>
    </div>
  );
}
