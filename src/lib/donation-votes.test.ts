import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildDonationVoteLeaderboard,
  resolveWinningCharity,
  tallyDonationVotes,
  type DonationVoteRow,
} from "./donation-votes.ts";

const charities = [
  { id: "unicef", name: "UNICEF Sverige" },
  { id: "rc", name: "Svenska Röda Korset" },
  { id: "msf", name: "Läkare Utan Gränser" },
];

function vote(charityId: string, name: string, votedAt: string): DonationVoteRow {
  return { charityId, charityName: name, votedAt };
}

describe("tallyDonationVotes", () => {
  it("counts votes per charity", () => {
    const tallies = tallyDonationVotes([
      vote("unicef", "UNICEF Sverige", "2026-01-01T10:00:00Z"),
      vote("unicef", "UNICEF Sverige", "2026-01-02T10:00:00Z"),
      vote("rc", "Svenska Röda Korset", "2026-01-03T10:00:00Z"),
    ]);
    const unicef = tallies.find((t) => t.charityId === "unicef");
    assert.equal(unicef?.voteCount, 2);
    assert.equal(unicef?.reachedCountAt, "2026-01-02T10:00:00Z");
  });
});

describe("buildDonationVoteLeaderboard", () => {
  it("sorts by vote count and marks leader", () => {
    const board = buildDonationVoteLeaderboard(
      [
        vote("unicef", "UNICEF Sverige", "2026-01-01T10:00:00Z"),
        vote("unicef", "UNICEF Sverige", "2026-01-02T10:00:00Z"),
        vote("unicef", "UNICEF Sverige", "2026-01-03T10:00:00Z"),
        vote("rc", "Svenska Röda Korset", "2026-01-04T10:00:00Z"),
        vote("rc", "Svenska Röda Korset", "2026-01-05T10:00:00Z"),
      ],
      charities,
    );
    assert.equal(board[0]?.charityId, "unicef");
    assert.equal(board[0]?.voteCount, 3);
    assert.equal(board[0]?.isLeading, true);
    assert.equal(board[1]?.charityId, "rc");
    assert.equal(board[1]?.isLeading, false);
    assert.equal(board[2]?.voteCount, 0);
  });
});

describe("resolveWinningCharity", () => {
  it("picks charity with most votes", () => {
    const winner = resolveWinningCharity([
      vote("unicef", "UNICEF Sverige", "2026-01-01T10:00:00Z"),
      vote("unicef", "UNICEF Sverige", "2026-01-02T10:00:00Z"),
      vote("rc", "Svenska Röda Korset", "2026-01-03T10:00:00Z"),
    ]);
    assert.deepEqual(winner, { charityId: "unicef", voteCount: 2 });
  });

  it("uses tiebreak: org that reached count first wins", () => {
    const winner = resolveWinningCharity([
      vote("unicef", "UNICEF Sverige", "2026-01-01T10:00:00Z"),
      vote("unicef", "UNICEF Sverige", "2026-01-05T10:00:00Z"),
      vote("rc", "Svenska Röda Korset", "2026-01-02T10:00:00Z"),
      vote("rc", "Svenska Röda Korset", "2026-01-03T10:00:00Z"),
    ]);
    assert.deepEqual(winner, { charityId: "rc", voteCount: 2 });
  });

  it("returns null when no votes", () => {
    assert.equal(resolveWinningCharity([]), null);
  });
});
