import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  pickPeopleCountForActiveEmployees,
  resolveFallbackCakePrice,
  resolvePriceFromRows,
  SEED_CAKE_PRICES,
} from "./cake-prices-data";

describe("pickPeopleCountForActiveEmployees", () => {
  it("picks smallest size >= active count", () => {
    assert.equal(pickPeopleCountForActiveEmployees([8, 12, 15, 20], 14), 15);
  });

  it("uses largest size when active count exceeds all options", () => {
    assert.equal(pickPeopleCountForActiveEmployees([8, 12, 15, 20], 25), 20);
  });
});

describe("resolveFallbackCakePrice", () => {
  it("uses HappySent Tårta 15 pers for 14 active employees", () => {
    const result = resolveFallbackCakePrice(SEED_CAKE_PRICES, 14);
    assert.equal(result.cakeName, "HappySent Tårta");
    assert.equal(result.peopleCount, 15);
    assert.equal(result.price, 990);
  });
});

describe("resolvePriceFromRows", () => {
  it("returns explicit price for valid combination", () => {
    assert.equal(
      resolvePriceFromRows(SEED_CAKE_PRICES, "Chokladtrippel", 6),
      595,
    );
  });
});
