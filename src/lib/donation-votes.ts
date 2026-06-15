export interface DonationVoteRow {
  charityId: string;
  charityName: string;
  votedAt: string;
}

export interface DonationVoteLeaderboardEntry {
  charityId: string;
  name: string;
  voteCount: number;
  votePercent: number;
  isLeading: boolean;
}

export interface DonationVoteTally {
  charityId: string;
  voteCount: number;
  reachedCountAt: string | null;
}

/** Aggregate votes per charity; reachedCountAt = timestamp when current count was reached. */
export function tallyDonationVotes(
  votes: DonationVoteRow[],
): DonationVoteTally[] {
  const byCharity = new Map<string, string[]>();

  for (const vote of votes) {
    const times = byCharity.get(vote.charityId) ?? [];
    times.push(vote.votedAt);
    byCharity.set(vote.charityId, times);
  }

  const tallies: DonationVoteTally[] = [];
  for (const [charityId, times] of byCharity) {
    const sorted = [...times].sort();
    const voteCount = sorted.length;
    tallies.push({
      charityId,
      voteCount,
      reachedCountAt: voteCount > 0 ? sorted[voteCount - 1]! : null,
    });
  }
  return tallies;
}

export function buildDonationVoteLeaderboard(
  votes: DonationVoteRow[],
  allCharityNames: Array<{ id: string; name: string }>,
): DonationVoteLeaderboardEntry[] {
  const tallies = tallyDonationVotes(votes);
  const tallyMap = new Map(tallies.map((t) => [t.charityId, t.voteCount]));
  const totalVotes = tallies.reduce((sum, t) => sum + t.voteCount, 0);
  const maxVotes = tallies.reduce(
    (max, t) => Math.max(max, t.voteCount),
    0,
  );

  const entries = allCharityNames.map(({ id, name }) => {
    const voteCount = tallyMap.get(id) ?? 0;
    return {
      charityId: id,
      name,
      voteCount,
      votePercent:
        totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0,
      isLeading: maxVotes > 0 && voteCount === maxVotes,
    };
  });

  return entries.sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    return a.name.localeCompare(b.name, "sv");
  });
}

export function resolveWinningCharity(
  votes: DonationVoteRow[],
): { charityId: string; voteCount: number } | null {
  const tallies = tallyDonationVotes(votes).filter((t) => t.voteCount > 0);
  if (tallies.length === 0) return null;

  const maxVotes = Math.max(...tallies.map((t) => t.voteCount));
  const leaders = tallies.filter((t) => t.voteCount === maxVotes);

  if (leaders.length === 1) {
    return { charityId: leaders[0]!.charityId, voteCount: maxVotes };
  }

  leaders.sort((a, b) => {
    const aTime = a.reachedCountAt ?? "";
    const bTime = b.reachedCountAt ?? "";
    if (aTime !== bTime) return aTime.localeCompare(bTime);
    return a.charityId.localeCompare(b.charityId);
  });

  return { charityId: leaders[0]!.charityId, voteCount: maxVotes };
}

export function votesByCharityRecord(
  votes: DonationVoteRow[],
): Record<string, number> {
  const record: Record<string, number> = {};
  for (const tally of tallyDonationVotes(votes)) {
    record[tally.charityId] = tally.voteCount;
  }
  return record;
}
