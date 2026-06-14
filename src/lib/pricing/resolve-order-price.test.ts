import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatCakeOrderLines,
  resolveCakeLineup,
  resolveCakePriceForHeadcount,
  resolveFallbackCakePrice,
  resolvePriceFromRows,
  SEED_CAKE_PRICES,
} from "./cake-prices-data";

describe("resolveCakeLineup", () => {
  const sizes = [8, 12, 15, 20];

  it("picks one cake with smallest size >= headcount", () => {
    assert.deepEqual(resolveCakeLineup(sizes, 9), [{ peopleCount: 12, quantity: 1 }]);
  });

  it("picks one cake for 14 active employees", () => {
    assert.deepEqual(resolveCakeLineup(sizes, 14), [{ peopleCount: 15, quantity: 1 }]);
  });

  it("combines max size with a smaller remainder cake for 21 people", () => {
    assert.deepEqual(resolveCakeLineup(sizes, 21), [
      { peopleCount: 20, quantity: 1 },
      { peopleCount: 8, quantity: 1 },
    ]);
  });

  it("uses two max-size cakes for 37 people", () => {
    assert.deepEqual(resolveCakeLineup(sizes, 37), [{ peopleCount: 20, quantity: 2 }]);
  });
});

describe("resolveFallbackCakePrice", () => {
  it("uses HappySent Tårta 15 pers for 14 active employees", () => {
    const result = resolveFallbackCakePrice(SEED_CAKE_PRICES, 14);
    assert.equal(result.cakeName, "HappySent Tårta");
    assert.deepEqual(result.lines, [{ peopleCount: 15, quantity: 1 }]);
    assert.equal(result.price, 990);
  });

  it("uses 20 pers + 8 pers for 21 active employees", () => {
    const result = resolveFallbackCakePrice(SEED_CAKE_PRICES, 21);
    assert.equal(result.cakeName, "HappySent Tårta");
    assert.deepEqual(result.lines, [
      { peopleCount: 20, quantity: 1 },
      { peopleCount: 8, quantity: 1 },
    ]);
    assert.equal(result.price, 1870);
  });
});

describe("resolveCakePriceForHeadcount", () => {
  it("uses chosen cake type with the same packing rules", () => {
    const result = resolveCakePriceForHeadcount(
      SEED_CAKE_PRICES,
      "Princesstårta",
      21,
    );
    assert.equal(result.cakeName, "Princesstårta");
    assert.deepEqual(result.lines, [
      { peopleCount: 20, quantity: 1 },
      { peopleCount: 8, quantity: 1 },
    ]);
    assert.equal(result.price, 1870);
  });
});

describe("formatCakeOrderLines", () => {
  it("formats mixed sizes", () => {
    assert.equal(
      formatCakeOrderLines("HappySent Tårta", [
        { peopleCount: 20, quantity: 1 },
        { peopleCount: 8, quantity: 1 },
      ]),
      "HappySent Tårta: 20 pers. + 8 pers.",
    );
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
