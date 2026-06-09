import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getCompanySession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KundAnstalldaPage() {
  const session = await getCompanySession();
  if (!session) return null;

  const supabase = createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, birthday, is_active, gift_type")
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
          <Link href="/kund/anstallda/import">
            <Button variant="secondary">Importera Excel</Button>
          </Link>
          <Link href="/kund/anstallda/ny">
            <Button>Lägg till</Button>
          </Link>
        </div>
      </div>

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
                <TH>Status</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {employees.map((e) => (
                <TR key={e.id}>
                  <TD>
                    {e.first_name} {e.last_name}
                  </TD>
                  <TD>{formatDate(e.birthday)}</TD>
                  <TD>{e.gift_type === "flowers" ? "Blommor" : "Tårta"}</TD>
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
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
