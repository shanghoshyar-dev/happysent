import { DonationCountdown } from "@/components/marketing/donation-countdown";
import { getDonationFundTotalKr } from "@/lib/donation-fund";

export async function DonationCountdownSection() {
  const totalKr = await getDonationFundTotalKr();
  return <DonationCountdown initialTotalKr={totalKr} />;
}
