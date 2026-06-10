import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCompanySession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { deleteKundEmployee, updateKundEmployee } from "../../../actions";
import { KundEmployeeForm } from "../kund-employee-form";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function KundEditAnstalldPage({ params }: Props) {
  const session = await getCompanySession();
  if (!session) redirect("/kund/login");

  const supabase = createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .eq("company_id", session.companyId)
    .maybeSingle();

  if (!employee) notFound();

  const companies = [{ id: session.companyId, name: session.companyName }];
  const update = updateKundEmployee.bind(null, employee.id);
  const remove = deleteKundEmployee.bind(null, employee.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-slate-900">
          {employee.first_name} {employee.last_name}
        </h1>
        <Link href="/kund/anstallda">
          <Button variant="secondary">Tillbaka</Button>
        </Link>
      </div>
      <Card className="max-w-3xl p-6">
        <KundEmployeeForm
          employee={employee}
          companies={companies}
          companyId={session.companyId}
          action={update}
          submitLabel="Spara ändringar"
        />
      </Card>
      <div className="mt-8 max-w-3xl rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-800">Ta bort anställd</h3>
        <p className="mt-1 text-sm text-red-700">
          Tar bort den anställda och tillhörande beställningar.
        </p>
        <form action={remove} className="mt-4">
          <Button type="submit" variant="danger">
            Ta bort
          </Button>
        </form>
      </div>
    </div>
  );
}
