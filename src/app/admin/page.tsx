import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  adjustDeliveryDate,
  birthdayThisYear,
  diffInDays,
  todayInStockholm,
  toDateString,
} from "@/lib/holidays/swedish";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatSek } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const today = todayInStockholm();
  const todayIso = toDateString(today);
  const startOfMonth = `${todayIso.slice(0, 7)}-01`;

  const [
    { count: companiesActive },
    { count: companiesPaused },
    { count: employeesActive },
    { count: bakeriesCount },
    { data: ordersThisMonth },
    { data: employees },
    { data: companies },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("status", "paused"),
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("bakeries").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, price, status")
      .gte("delivery_date", startOfMonth),
    supabase
      .from("employees")
      .select("id, first_name, last_name, birthday, company_id")
      .eq("is_active", true),
    supabase.from("companies").select("id, name, price_per_cake, status"),
  ]);

  const companyMap = new Map(
    (companies ?? []).map((c) => [
      c.id,
      { name: c.name, price: c.price_per_cake, status: c.status },
    ]),
  );

  const upcoming = (employees ?? [])
    .map((e) => {
      const company = companyMap.get(e.company_id);
      if (!company || company.status !== "active") return null;
      const bday = birthdayThisYear(e.birthday, today);
      const delivery = adjustDeliveryDate(bday);
      const days = diffInDays(delivery, today);
      if (days < 0 || days > 30) return null;
      return {
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        company: company.name,
        deliveryIso: toDateString(delivery),
        days,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.days - b.days)
    .slice(0, 10);

  const ordersCount = ordersThisMonth?.length ?? 0;
  const ordersRevenue = (ordersThisMonth ?? []).reduce(
    (sum, o) => sum + (o.price ?? 0),
    0,
  );

  const mrr = (employees ?? []).reduce((sum, e) => {
    const company = companyMap.get(e.company_id);
    if (!company || company.status !== "active") return sum;
    return sum + company.price / 12;
  }, 0);

  return (
    <div>
      <PageHeader
        title="Översikt"
        description={`Idag ${formatDate(todayIso)} – välkommen tillbaka.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="🏢"
          label="Aktiva företag"
          value={companiesActive ?? 0}
          hint={
            (companiesPaused ?? 0) > 0 ? `${companiesPaused} pausade` : undefined
          }
        />
        <StatCard
          icon="🎂"
          label="Aktiva anställda"
          value={employeesActive ?? 0}
        />
        <StatCard
          icon="📦"
          label="Beställningar denna månad"
          value={ordersCount}
          hint={formatSek(ordersRevenue)}
        />
        <StatCard
          icon="💰"
          label="Estimerad MRR"
          value={formatSek(Math.round(mrr))}
          hint={`${bakeriesCount ?? 0} bagerier`}
        />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl text-slate-900">
          Födelsedagar nästa 30 dagar
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            title="Inga födelsedagar på 30 dagar"
            description="När en anställd har födelsedag dyker den upp här."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Anställd</TH>
                <TH>Företag</TH>
                <TH>Leveransdag</TH>
                <TH>Om</TH>
              </TR>
            </THead>
            <TBody>
              {upcoming.map((u) => (
                <TR key={u.id}>
                  <TD className="font-medium text-slate-900">{u.name}</TD>
                  <TD>{u.company}</TD>
                  <TD>{formatDate(u.deliveryIso)}</TD>
                  <TD>
                    <Badge tone={u.days <= 7 ? "candy" : "neutral"}>
                      {u.days === 0
                        ? "Idag"
                        : u.days === 1
                          ? "Imorgon"
                          : `${u.days} dagar`}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
