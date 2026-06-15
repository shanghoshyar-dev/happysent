"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { setKundDonationVote } from "../../actions";

interface CharityOption {
  id: string;
  name: string;
}

interface Props {
  charities: CharityOption[];
  selectedCharityId: string | null;
}

export function DonationVoteForm({ charities, selectedCharityId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState(selectedCharityId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function submit() {
    if (!choice) {
      setError("Välj en organisation innan du sparar.");
      return;
    }
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setKundDonationVote(choice);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Card className="max-w-2xl p-6">
      <p className="text-sm text-slate-600">
        Rösta på vilken organisation du vill ska få hela årets donationskassa.
        Du kan byta röst när som helst före 31 december.
      </p>
      <fieldset className="mt-6 space-y-3">
        <legend className="sr-only">Välj organisation</legend>
        {charities.map((charity) => (
          <label
            key={charity.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              choice === charity.id
                ? "border-candy-400 bg-candy-50"
                : "border-candy-100 bg-white hover:bg-cream-50"
            }`}
          >
            <input
              type="radio"
              name="charity_id"
              value={charity.id}
              checked={choice === charity.id}
              onChange={() => setChoice(charity.id)}
              className="h-4 w-4 border-candy-300 text-candy-500 focus:ring-candy-300"
            />
            <span className="text-sm font-medium text-slate-800">
              {charity.name}
            </span>
          </label>
        ))}
      </fieldset>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {saved ? (
        <p className="mt-4 text-sm text-emerald-700">
          Din röst är sparad. Tack för att du engagerar dig!
        </p>
      ) : null}
      <Button
        type="button"
        className="mt-6"
        disabled={pending || !choice}
        onClick={submit}
      >
        {pending ? "Sparar…" : selectedCharityId ? "Uppdatera röst" : "Spara röst"}
      </Button>
    </Card>
  );
}
