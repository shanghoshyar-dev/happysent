import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { orderEmployeeDisplayName } from "./employee-name";

describe("orderEmployeeDisplayName", () => {
  it("prefers linked employee name", () => {
    assert.equal(
      orderEmployeeDisplayName({
        employee_first_name: "Old",
        employee_last_name: "Name",
        employees: { first_name: "Kalle", last_name: "Svensson" },
      }),
      "Kalle Svensson",
    );
  });

  it("uses snapshot when employee is deleted", () => {
    assert.equal(
      orderEmployeeDisplayName({
        employee_first_name: "Kalle",
        employee_last_name: "Svensson",
        employees: null,
      }),
      "Kalle Svensson",
    );
  });
});
