import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/database";

interface FloristFormProps {
  florist?: Tables<"florists"> | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function FloristForm({ florist, action, submitLabel }: FloristFormProps) {
  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label htmlFor="florist_name">Butiksnamn</Label>
        <Input
          id="florist_name"
          name="name"
          required
          defaultValue={florist?.name}
        />
      </div>
      <div>
        <Label htmlFor="florist_email">E-post</Label>
        <Input
          id="florist_email"
          name="email"
          type="email"
          required
          defaultValue={florist?.email}
        />
      </div>
      <div>
        <Label htmlFor="florist_phone">Telefon</Label>
        <Input id="florist_phone" name="phone" defaultValue={florist?.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="florist_city">Stad</Label>
        <Input id="florist_city" name="city" required defaultValue={florist?.city} />
      </div>
      <div>
        <Label htmlFor="florist_days_notice">Dagar i förväg</Label>
        <Input
          id="florist_days_notice"
          name="days_notice"
          type="number"
          min={1}
          defaultValue={florist?.days_notice ?? 7}
          required
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="florist_opening_hours">Öppettider</Label>
        <Input
          id="florist_opening_hours"
          name="opening_hours"
          defaultValue={florist?.opening_hours ?? ""}
          placeholder="Mån–Lör 09:00–18:00"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="florist_notes">Anteckningar</Label>
        <Textarea
          id="florist_notes"
          name="notes"
          defaultValue={florist?.notes ?? ""}
          rows={4}
        />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
