import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ageOnDate,
  celebrationOccasionsInYear,
  deliveryOccasionsInYear,
  isDecadeMilestoneAge,
  shouldProcessDelivery,
} from "./celebrations.ts";
import { parseDateString, toDateString } from "./holidays/swedish.ts";

describe("ageOnDate", () => {
  it("returns 30 on birthday 1996-03-15 in 2026", () => {
    assert.equal(
      ageOnDate("1996-03-15", parseDateString("2026-03-15")),
      30,
    );
  });

  it("returns 29 the day before 30th birthday", () => {
    assert.equal(
      ageOnDate("1996-03-15", parseDateString("2026-03-14")),
      29,
    );
  });
});

describe("isDecadeMilestoneAge", () => {
  it("accepts 20–80 even decades only", () => {
    assert.equal(isDecadeMilestoneAge(20), true);
    assert.equal(isDecadeMilestoneAge(30), true);
    assert.equal(isDecadeMilestoneAge(25), false);
    assert.equal(isDecadeMilestoneAge(19), false);
  });
});

describe("decade frequency", () => {
  const rule = {
    birthday: "1996-03-15",
    celebration_frequency: "decade" as const,
  };

  it("includes birthday in milestone year 2026", () => {
    const occasions = celebrationOccasionsInYear(rule, 2026);
    assert.equal(occasions.length, 1);
    assert.equal(toDateString(occasions[0].nominalDate), "2026-03-15");
  });

  it("has no occasions in non-milestone year 2027", () => {
    assert.equal(celebrationOccasionsInYear(rule, 2027).length, 0);
  });
});

describe("twice_yearly frequency", () => {
  const rule = {
    birthday: "1990-06-15",
    celebration_frequency: "twice_yearly" as const,
  };

  it("produces two delivery dates in the same year", () => {
    const deliveries = deliveryOccasionsInYear(rule, 2026);
    assert.equal(deliveries.length, 2);
    assert.equal(deliveries[0].occasion, "birthday");
    assert.equal(deliveries[1].occasion, "half_year");
    assert.notEqual(deliveries[0].deliveryIso, deliveries[1].deliveryIso);
  });
});

describe("shouldProcessDelivery", () => {
  it("uses nominal date for decade check when delivery is adjusted earlier", () => {
    const rule = {
      birthday: "1996-03-15",
      celebration_frequency: "decade" as const,
    };
    const deliveries = deliveryOccasionsInYear(rule, 2026);
    assert.equal(deliveries.length, 1);
    assert.equal(shouldProcessDelivery(rule, deliveries[0]), true);
  });
});
