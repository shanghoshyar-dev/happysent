import { DonationCountdown } from "@/components/marketing/donation-countdown";
import {
  closeDonationCampaignIfDue,
  getDonationFundTotalKr,
  getDonationVoteLeaderboard,
  getPreviousYearDonationSnapshot,
} from "@/lib/donation-fund";

export async function DonationCountdownSection() {
  await closeDonationCampaignIfDue();

  const [totalKr, previousYear, leaderboard] = await Promise.all([
    getDonationFundTotalKr(),
    getPreviousYearDonationSnapshot(),
    getDonationVoteLeaderboard(),
  ]);

  return (
    <DonationCountdown
      initialTotalKr={totalKr}
      previousYear={previousYear}
      leaderboard={leaderboard}
    />
  );
}
