import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CelebrationFrequency, GiftType } from "@/lib/celebrations";
import type { Tables } from "@/types/database";

interface EmployeeFormProps {
  employee?: Tables<"employees"> | null;
  companies: { id: string; name: string }[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultCompanyId?: string;
}

export function EmployeeForm({
  employee,
  companies,
  action,
  submitLabel,
  defaultCompanyId,
}: EmployeeFormProps) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label htmlFor="company_id">Företag</Label>
        <Select
          id="company_id"
          name="company_id"
          required
          defaultValue={
            employee?.company_id ?? defaultCompanyId ?? companies[0]?.id ?? ""
          }
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="first_name">Förnamn</Label>
        <Input
          id="first_name"
          name="first_name"
          required
          defaultValue={employee?.first_name}
        />
      </div>
      <div>
        <Label htmlFor="last_name">Efternamn</Label>
        <Input
          id="last_name"
          name="last_name"
          required
          defaultValue={employee?.last_name}
        />
      </div>
      <div>
        <Label htmlFor="birthday">Födelsedag</Label>
        <Input
          id="birthday"
          name="birthday"
          type="date"
          required
          defaultValue={employee?.birthday}
        />
      </div>
      <div>
        <Label htmlFor="number_of_people">Antal personer på avd.</Label>
        <Input
          id="number_of_people"
          name="number_of_people"
          type="number"
          min={1}
          required
          defaultValue={employee?.number_of_people ?? 1}
        />
      </div>
      <div>
        <Label htmlFor="celebration_frequency">Firande</Label>
        <Select
          id="celebration_frequency"
          name="celebration_frequency"
          defaultValue={
            (employee?.celebration_frequency as CelebrationFrequency | undefined) ??
            "every_year"
          }
        >
          <option value="every_year">Varje år</option>
          <option value="twice_yearly">
            Två gånger per år (födelsedag + halvår)
          </option>
          <option value="decade">Jämna år (20, 30, 40 …)</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="gift_type">Gåva</Label>
        <Select
          id="gift_type"
          name="gift_type"
          defaultValue={
            (employee?.gift_type as GiftType | undefined) ?? "cake"
          }
        >
          <option value="cake">Tårta</option>
          <option value="flowers">Blommor</option>
        </Select>
        <p className="mt-1 text-xs text-slate-500">
          Blommor kräver att företaget har blomsterpartner aktiverad.
        </p>
      </div>
      <div className="flex items-center gap-2 md:col-span-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={employee?.is_active ?? true}
          className="h-4 w-4 rounded border-candy-300 text-candy-500 focus:ring-candy-300"
        />
        <Label htmlFor="is_active" className="mb-0">
          Aktiv
        </Label>
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
