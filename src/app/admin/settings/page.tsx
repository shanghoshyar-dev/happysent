import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppSettings, resolveAdminEmail } from "@/lib/app-settings";

import { saveAppSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAppSettings();
  const effectiveAdminEmail = resolveAdminEmail(settings);

  return (
    <div>
      <PageHeader
        title="Inställningar"
        description="Operativa standardvärden för mejl, priser och avbokningsregler."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inställningar" },
        ]}
      />

      <Card className="max-w-xl space-y-6 p-6">
        <p className="text-sm text-slate-600">
          Aktuell administratörsinkorg (effektiv):{" "}
          <span className="font-medium text-slate-900">
            {effectiveAdminEmail || "— (sätt ADMIN_EMAIL i miljön)"}
          </span>
        </p>

        <form action={saveAppSettings} className="space-y-5">
          <div>
            <Label htmlFor="admin_email_override">
              ADMIN_EMAIL (override, valfritt)
            </Label>
            <Input
              id="admin_email_override"
              name="admin_email_override"
              type="email"
              placeholder="info@happysent.com"
              defaultValue={settings.admin_email_override ?? ""}
            />
            <p className="mt-1 text-xs text-slate-500">
              Om tomt används miljövariabeln ADMIN_EMAIL.
            </p>
          </div>

          <div>
            <Label htmlFor="default_price_per_cake">
              Standardpris per tårta (SEK)
            </Label>
            <Input
              id="default_price_per_cake"
              name="default_price_per_cake"
              type="number"
              min={0}
              required
              defaultValue={settings.default_price_per_cake}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="delivery_window_start">
                Leverans start (HH:MM)
              </Label>
              <Input
                id="delivery_window_start"
                name="delivery_window_start"
                required
                placeholder="08:00"
                defaultValue={settings.delivery_window_start}
              />
            </div>
            <div>
              <Label htmlFor="delivery_window_end">Leverans slut (HH:MM)</Label>
              <Input
                id="delivery_window_end"
                name="delivery_window_end"
                required
                placeholder="11:00"
                defaultValue={settings.delivery_window_end}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cancellation_days_before_delivery">
              Avbokningspolicy (dagar före leverans)
            </Label>
            <Input
              id="cancellation_days_before_delivery"
              name="cancellation_days_before_delivery"
              type="number"
              min={0}
              required
              defaultValue={settings.cancellation_days_before_delivery}
            />
            <p className="mt-1 text-xs text-slate-500">
              Beställningar kan bara avbokas om fler än så här många dagar
              återstår till leveransdagen.
            </p>
          </div>

          <Button type="submit">Spara inställningar</Button>
        </form>
      </Card>
    </div>
  );
}
