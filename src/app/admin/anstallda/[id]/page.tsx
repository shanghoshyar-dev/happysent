import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { deleteEmployee, updateEmployee } from "../actions";
import { EmployeeForm } from "../employee-form";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function EditEmployeePage({ params }: Props) {
  const supabase = createClient();
  const [{ data: employee }, { data: companies }] = await Promise.all([
    supabase.from("employees").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("companies").select("id, name").order("name"),
  ]);

  if (!employee || !companies) notFound();

  const update = updateEmployee.bind(null, employee.id);
  const remove = deleteEmployee.bind(null, employee.id);

  return (
    <div>
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description="Redigera uppgifter för denna anställd."
        action={
          <Link href="/admin/anstallda">
            <Button variant="secondary">Tillbaka</Button>
          </Link>
        }
      />

      <Card className="max-w-3xl">
        <EmployeeForm
          employee={employee}
          companies={companies}
          action={update}
          submitLabel="Spara ändringar"
        />
      </Card>

      <div className="mt-8 max-w-3xl rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-800">Ta bort anställd</h3>
        <p className="mt-1 text-sm text-red-700">
          Tar bort den anställda och alla tillhörande beställningar.
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
