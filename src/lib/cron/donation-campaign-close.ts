import "server-only";

import {
  closeDonationCampaignIfDue,
  type DonationCampaignCloseResult,
} from "@/lib/donation-fund";

export type { DonationCampaignCloseResult };

export async function runDonationCampaignClose(
  now: Date = new Date(),
): Promise<DonationCampaignCloseResult> {
  return closeDonationCampaignIfDue(now);
}
