import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/database";

interface BakeryFormProps {
  bakery?: Tables<"bakeries"> | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function BakeryForm({ bakery, action, submitLabel }: BakeryFormProps) {
  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label htmlFor="name">Bagerinamn</Label>
        <Input id="name" name="name" required defaultValue={bakery?.name} />
      </div>
      <div>
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={bakery?.email}
        />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" name="phone" defaultValue={bakery?.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="city">Stad</Label>
        <Input id="city" name="city" required defaultValue={bakery?.city} />
      </div>
      <div>
        <Label htmlFor="days_notice">Dagar i förväg</Label>
        <Input
          id="days_notice"
          name="days_notice"
          type="number"
          min={1}
          defaultValue={bakery?.days_notice ?? 7}
          required
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="opening_hours">Öppettider</Label>
        <Input
          id="opening_hours"
          name="opening_hours"
          defaultValue={bakery?.opening_hours ?? ""}
          placeholder="Mån–Fre 07:00–18:00"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="notes">Anteckningar</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={bakery?.notes ?? ""}
          rows={4}
        />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
