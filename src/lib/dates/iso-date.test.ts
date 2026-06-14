import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatIsoDateInput, parseIsoDateYYYYMMDD } from "./iso-date";

describe("formatIsoDateInput", () => {
  it("formats year only", () => {
    assert.equal(formatIsoDateInput("1997"), "1997");
  });

  it("formats year and month", () => {
    assert.equal(formatIsoDateInput("199712"), "1997-12");
  });

  it("formats full date", () => {
    assert.equal(formatIsoDateInput("19971212"), "1997-12-12");
  });

  it("strips non-digits and caps at 8 digits", () => {
    assert.equal(formatIsoDateInput("1997-12-12extra99"), "1997-12-12");
  });
});

describe("parseIsoDateYYYYMMDD", () => {
  it("accepts valid dates", () => {
    assert.equal(parseIsoDateYYYYMMDD("1997-12-12"), "1997-12-12");
  });

  it("rejects invalid calendar dates", () => {
    assert.equal(parseIsoDateYYYYMMDD("1997-13-01"), null);
    assert.equal(parseIsoDateYYYYMMDD("1997-12-32"), null);
  });
});
