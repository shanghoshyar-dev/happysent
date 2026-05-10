import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Tables } from "@/types/database";

interface CompanyFormProps {
  bakeries: Pick<Tables<"bakeries">, "id" | "name" | "city">[];
  company?: Tables<"companies"> | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function CompanyForm({
  bakeries,
  company,
  action,
  submitLabel,
}: CompanyFormProps) {
  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label htmlFor="name">Företagsnamn</Label>
        <Input id="name" name="name" required defaultValue={company?.name} />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address">Adress</Label>
        <Input
          id="address"
          name="address"
          required
          defaultValue={company?.address}
        />
      </div>
      <div>
        <Label htmlFor="city">Stad</Label>
        <Input id="city" name="city" required defaultValue={company?.city} />
      </div>
      <div>
        <Label htmlFor="bakery_id">Bageri</Label>
        <Select
          id="bakery_id"
          name="bakery_id"
          required
          defaultValue={company?.bakery_id ?? ""}
        >
          <option value="" disabled>
            Välj bageri
          </option>
          {bakeries.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.city})
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="contact_email">Kontakt-mail</Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          required
          defaultValue={company?.contact_email}
        />
      </div>
      <div>
        <Label htmlFor="billing_email">Faktura-mail</Label>
        <Input
          id="billing_email"
          name="billing_email"
          type="email"
          required
          defaultValue={company?.billing_email}
        />
      </div>
      <div>
        <Label htmlFor="price_per_cake">Pris per tårta (SEK)</Label>
        <Input
          id="price_per_cake"
          name="price_per_cake"
          type="number"
          min={0}
          required
          defaultValue={company?.price_per_cake ?? 450}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={company?.status ?? "active"}>
          <option value="active">Aktivt</option>
          <option value="paused">Pausat</option>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
