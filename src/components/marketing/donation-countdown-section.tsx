import { DonationCountdown } from "@/components/marketing/donation-countdown";
import {
  closeDonationCampaignIfDue,
  getDonationFundTotalKr,
  getPreviousYearDonationSnapshot,
} from "@/lib/donation-fund";

export async function DonationCountdownSection() {
  await closeDonationCampaignIfDue();

  const [totalKr, previousYear] = await Promise.all([
    getDonationFundTotalKr(),
    getPreviousYearDonationSnapshot(),
  ]);

  return (
    <DonationCountdown
      initialTotalKr={totalKr}
      previousYear={previousYear}
    />
  );
}
