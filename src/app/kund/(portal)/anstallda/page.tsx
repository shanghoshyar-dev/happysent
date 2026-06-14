import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { formatCatchUpNotice } from "@/lib/cron/catch-up-message";
import { getCompanySession } from "@/lib/auth/session";
import { displayProductName } from "@/lib/cake-selection/product-name";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { catchupDays?: string };
}

export default async function KundAnstalldaPage({ searchParams }: Props) {
  const session = await getCompanySession();
  if (!session) return null;

  const catchupDays = Number(searchParams.catchupDays);
  const catchUpNotice =
    Number.isFinite(catchupDays) && catchupDays >= 0 && catchupDays < 14
      ? formatCatchUpNotice(catchupDays)
      : null;

  const supabase = createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select(
      "id, first_name, last_name, birthday, is_active, gift_type, preferred_product_id, products:preferred_product_id ( name )",
    )
    .eq("company_id", session.companyId)
    .order("last_name")
    .order("first_name");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Anställda</h1>
          <p className="mt-2 text-slate-600">
            Lägg till, pausa eller uppdatera era medarbetare.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/kund/anstallda/import"
            className="inline-flex h-10 items-center justify-center rounded-full border border-candy-200 bg-white px-4 text-sm font-medium text-candy-700 transition-all hover:bg-candy-50"
          >
            Importera Excel
          </Link>
          <Link
            href="/kund/anstallda/ny"
            className="inline-flex h-10 items-center justify-center rounded-full bg-candy-500 px-4 text-sm font-medium text-white shadow-soft transition-all hover:bg-candy-600"
          >
            Lägg till
          </Link>
        </div>
      </div>

      {catchUpNotice ? (
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {catchUpNotice}
        </p>
      ) : null}

      {!employees || employees.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Inga anställda ännu"
            description="Lägg till manuellt eller importera från Excel."
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-x-auto p-0">
          <Table>
            <THead>
              <TR>
                <TH>Namn</TH>
                <TH>Födelsedag</TH>
                <TH>Gåva</TH>
                <TH>Favorittårta</TH>
                <TH>Status</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {employees.map((e) => {
                const product = e.products as { name: string } | null;
                return (
                <TR key={e.id}>
                  <TD>
                    {e.first_name} {e.last_name}
                  </TD>
                  <TD>{formatDate(e.birthday)}</TD>
                  <TD>{e.gift_type === "flowers" ? "Blommor" : "Tårta"}</TD>
                  <TD>
                    {e.gift_type === "cake" && product?.name ? (
                      displayProductName(product.name)
                    ) : e.gift_type === "cake" ? (
                      <Link
                        href="/kund/tartor"
                        className="text-sm text-coral-600 hover:underline"
                      >
                        Välj tårta
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD>
                    <Badge tone={e.is_active ? "success" : "neutral"}>
                      {e.is_active ? "Aktiv" : "Pausad"}
                    </Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/kund/anstallda/${e.id}`}
                      className="text-sm font-medium text-coral-600 hover:underline"
                    >
                      Redigera
                    </Link>
                  </TD>
                </TR>
              );
              })}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
