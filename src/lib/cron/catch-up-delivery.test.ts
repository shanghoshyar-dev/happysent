import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  catchUpReminderTypes,
  isCatchUpEligible,
  shouldAutoPickCake,
} from "./catch-up-rules.ts";

describe("isCatchUpEligible", () => {
  it("allows 0–13 days", () => {
    assert.equal(isCatchUpEligible(13), true);
    assert.equal(isCatchUpEligible(0), true);
  });

  it("skips 14+ days and past deliveries", () => {
    assert.equal(isCatchUpEligible(14), false);
    assert.equal(isCatchUpEligible(-1), false);
  });
});

describe("catchUpReminderTypes", () => {
  it("schedules 14-day email at 12 days without auto-pick reminders", () => {
    const types = catchUpReminderTypes(12, "cake");
    assert.deepEqual(types, ["14_days"]);
    assert.equal(shouldAutoPickCake(12), false);
  });

  it("auto-picks at 7 days and sends partner + company emails", () => {
    assert.equal(shouldAutoPickCake(7), true);
    assert.deepEqual(catchUpReminderTypes(7, "cake"), [
      "7_days_bakery",
      "7_days_company",
    ]);
  });

  it("at 3 days sends urgent bakery path without 14-day mail", () => {
    assert.equal(shouldAutoPickCake(3), true);
    const types = catchUpReminderTypes(3, "cake");
    assert.ok(!types.includes("14_days"));
    assert.deepEqual(types, ["7_days_bakery", "7_days_company"]);
  });

  it("uses florist partner for flowers within 7 days", () => {
    assert.deepEqual(catchUpReminderTypes(5, "flowers"), [
      "7_days_florist",
      "7_days_company",
    ]);
  });

  it("sends 1-day mail only on the last day before delivery", () => {
    assert.deepEqual(catchUpReminderTypes(1, "cake"), [
      "7_days_bakery",
      "7_days_company",
      "1_day",
    ]);
  });

  it("sends day-of mail on delivery day", () => {
    assert.deepEqual(catchUpReminderTypes(0, "cake"), [
      "7_days_bakery",
      "7_days_company",
      "day_of",
    ]);
  });

  it("returns nothing when catch-up window does not apply", () => {
    assert.deepEqual(catchUpReminderTypes(14, "cake"), []);
    assert.deepEqual(catchUpReminderTypes(-2, "cake"), []);
  });
});

describe("shouldAutoPickCake", () => {
  it("auto-picks through day 9", () => {
    assert.equal(shouldAutoPickCake(9), true);
    assert.equal(shouldAutoPickCake(10), false);
  });
});
