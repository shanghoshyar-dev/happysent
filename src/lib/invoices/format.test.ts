import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  exclVatFromIncl,
  totalInclFromLineItems,
  vatFromIncl,
  VAT_RATE,
} from "./format";

describe("VAT incl 6%", () => {
  it("uses 6% rate", () => {
    assert.equal(VAT_RATE, 0.06);
  });

  it("splits 990 kr incl into excl + vat", () => {
    assert.equal(exclVatFromIncl(990), 934);
    assert.equal(vatFromIncl(990), 56);
    assert.equal(exclVatFromIncl(990) + vatFromIncl(990), 990);
  });

  it("sums line items as incl total", () => {
    assert.equal(totalInclFromLineItems([675, 990]), 1665);
  });
});
