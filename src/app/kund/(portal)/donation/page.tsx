import { DonationVoteForm } from "./donation-vote-form";
import { getCompanySession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function KundDonationPage() {
  const session = await getCompanySession();
  if (!session) return null;

  const supabase = createClient();
  const [{ data: charities }, { data: company }] = await Promise.all([
    supabase
      .from("donation_charities")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("companies")
      .select("donation_charity_id")
      .eq("id", session.companyId)
      .maybeSingle(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-slate-900">Donationsröstning</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        HappySent samlar in 10 kr per levererad tårta och blomma till en gemensam
        kassa. Organisationen med flest kundröster får hela summan när året är
        slut.
      </p>
      <div className="mt-8">
        <DonationVoteForm
          charities={charities ?? []}
          selectedCharityId={company?.donation_charity_id ?? null}
        />
      </div>
    </div>
  );
}
