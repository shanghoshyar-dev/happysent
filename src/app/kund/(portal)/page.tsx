import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCompanySession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KundDashboardPage() {
  const session = await getCompanySession();
  if (!session) return null;

  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: employeeCount }, { data: upcoming }] = await Promise.all([
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("company_id", session.companyId)
      .eq("is_active", true),
    supabase
      .from("orders")
      .select(
        `
        id, delivery_date, gift_type,
        employees:employee_id ( first_name, last_name )
      `,
      )
      .eq("company_id", session.companyId)
      .gte("delivery_date", today)
      .order("delivery_date")
      .limit(8),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-slate-900">Översikt</h1>
      <p className="mt-2 text-slate-600">
        Välkommen — här ser ni kommande firanden och kan hantera personal.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm text-slate-500">Aktiva anställda</p>
          <p className="mt-1 font-display text-3xl text-slate-900">
            {employeeCount ?? 0}
          </p>
          <Link
            href="/kund/anstallda"
            className="mt-3 inline-block text-sm font-medium text-coral-600 hover:underline"
          >
            Hantera anställda
          </Link>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500">Kommande leveranser</p>
          <p className="mt-1 font-display text-3xl text-slate-900">
            {upcoming?.length ?? 0}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Tårtval sker via mejl 14 dagar före leverans.
          </p>
        </Card>
      </div>

      {upcoming && upcoming.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-semibold text-slate-900">Nästa firanden</h2>
          <ul className="mt-4 space-y-3">
            {upcoming.map((o) => {
              const emp = o.employees as {
                first_name: string;
                last_name: string;
              } | null;
              return (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-candy-100 bg-white px-4 py-3"
                >
                  <span className="font-medium text-slate-900">
                    {emp ? `${emp.first_name} ${emp.last_name}` : "—"}
                  </span>
                  <span className="text-sm text-slate-600">
                    {formatDate(o.delivery_date)}
                  </span>
                  <Badge tone={o.gift_type === "flowers" ? "candy" : "neutral"}>
                    {o.gift_type === "flowers" ? "Blommor" : "Tårta"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
