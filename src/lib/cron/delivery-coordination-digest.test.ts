import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatCompanyAddress,
  formatDeliveryCoordinationDigestText,
  formatGiftDetail,
  groupDeliveryCoordinationRows,
  type DeliveryCoordinationRow,
} from "./delivery-coordination-digest.ts";
import { parseDateString } from "../holidays/swedish.ts";

const today = parseDateString("2026-05-20");

const sampleRow = (
  overrides: Partial<DeliveryCoordinationRow> = {},
): DeliveryCoordinationRow => ({
  deliveryDate: "2026-05-20",
  companyName: "Acme AB",
  companyAddress: "Storgatan 1",
  companyCity: "Malmö",
  contactPhone: "070-123 45 67",
  employeeName: "Kalle Anka",
  giftType: "cake",
  productName: null,
  cakeName: "Jordgubbstårta",
  peopleCount: 12,
  cakeQuantity: 1,
  cakeLines: [],
  ...overrides,
});

describe("delivery coordination digest", () => {
  it("formats company address with city", () => {
    assert.equal(
      formatCompanyAddress("Storgatan 1", "Malmö"),
      "Storgatan 1, Malmö",
    );
  });

  it("formats cake gift detail from cake name and people count", () => {
    assert.equal(
      formatGiftDetail(sampleRow()),
      "Jordgubbstårta: 12 pers.",
    );
  });

  it("groups rows by delivery date with idag/imorgon headings", () => {
    const groups = groupDeliveryCoordinationRows(
      [
        sampleRow({ deliveryDate: "2026-05-21", companyName: "Beta AB" }),
        sampleRow(),
      ],
      today,
    );

    assert.equal(groups.length, 2);
    assert.match(groups[0]!.heading, /^Idag,/);
    assert.match(groups[1]!.heading, /^Imorgon,/);
    assert.equal(groups[0]!.rows.length, 1);
    assert.equal(groups[0]!.rows[0]!.companyName, "Acme AB");
  });

  it("builds digest text with address and employee per line", () => {
    const groups = groupDeliveryCoordinationRows([sampleRow()], today);
    const text = formatDeliveryCoordinationDigestText({ today, groups });

    assert.match(text, /Acme AB \| Kalle Anka \| Storgatan 1, Malmö/);
    assert.match(text, /070-123 45 67/);
    assert.match(text, /Jordgubbstårta: 12 pers\./);
    assert.match(text, /7 dagar framåt/);
  });
});
