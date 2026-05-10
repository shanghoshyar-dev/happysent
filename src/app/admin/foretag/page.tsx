import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatSek } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ForetagPage() {
  const supabase = createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select(
      "id, name, city, contact_email, price_per_cake, status, bakeries:bakery_id ( name )",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Företag"
        description="Företagen som vi levererar tårtor till."
        action={
          <Link href="/admin/foretag/nytt">
            <Button>Nytt företag</Button>
          </Link>
        }
      />

      {!companies || companies.length === 0 ? (
        <EmptyState
          title="Inga företag ännu"
          description="Lägg till ert första företag för att komma igång."
          action={
            <Link href="/admin/foretag/nytt">
              <Button>Lägg till företag</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Namn</TH>
              <TH>Stad</TH>
              <TH>Bageri</TH>
              <TH>Kontakt</TH>
              <TH>Pris/tårta</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {companies.map((c) => {
              const bakeryName = (c.bakeries as { name: string } | null)?.name;
              return (
                <TR key={c.id}>
                  <TD className="font-medium text-slate-900">
                    <Link
                      href={`/admin/foretag/${c.id}`}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TD>
                  <TD>{c.city}</TD>
                  <TD>{bakeryName ?? "—"}</TD>
                  <TD>{c.contact_email}</TD>
                  <TD>{formatSek(c.price_per_cake)}</TD>
                  <TD>
                    <Badge tone={c.status === "active" ? "success" : "warning"}>
                      {c.status === "active" ? "Aktivt" : "Pausat"}
                    </Badge>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
