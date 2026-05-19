import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { fetchEmployeeChangeRequestById } from "@/lib/admin/employee-change-requests";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

import { ApproveEmployeeChangeForm } from "./approve-form";

export const dynamic = "force-dynamic";

export default async function GodkannPersonalPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const request = await fetchEmployeeChangeRequestById(supabase, params.id);
  if (!request) notFound();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, city")
    .order("name");

  return (
    <div>
      <PageHeader
        title="Godkänn personaländring"
        description="Välj vilket företag ärendet gäller om automatisk matchning misslyckades."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Kölista", href: "/admin/kolista" },
          { label: "Godkänn" },
        ]}
      />

      <Card className="mb-6 max-w-3xl space-y-4 p-6">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">
            {request.action_type === "add" ? "Lägg till" : "Ta bort"}
          </strong>{" "}
          · Inkommen {formatDate(request.created_at.slice(0, 10))}
        </p>
        <p className="text-sm text-slate-700">
          <strong>Företag (enligt kund):</strong> {request.company_name}
          <br />
          {request.address}, {request.postal_code} {request.city}
        </p>
        <ul className="list-inside list-disc text-sm text-slate-700">
          {request.employees.map((e) => (
            <li key={`${e.first_name}-${e.last_name}-${e.birthday}`}>
              {e.first_name} {e.last_name} — födelsedag {e.birthday}
            </li>
          ))}
        </ul>
        {request.message?.trim() ? (
          <p className="whitespace-pre-wrap rounded-lg bg-cream-50 px-3 py-2 text-sm text-slate-600">
            {request.message}
          </p>
        ) : null}
      </Card>

      <Card className="max-w-3xl p-6">
        <ApproveEmployeeChangeForm
          requestId={request.id}
          companies={companies ?? []}
          suggestedCompanyId={request.matched_company_id}
        />
      </Card>
    </div>
  );
}
