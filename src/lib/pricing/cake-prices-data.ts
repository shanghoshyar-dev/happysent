/** Static seed data — keep in sync with migration cake_prices inserts. */
export interface CakePriceRow {
  cake_name: string;
  people_count: number;
  price: number;
  is_default: boolean;
}

export const DEFAULT_CAKE_NAME = "HappySent Tårta";

export interface CakeOrderLine {
  peopleCount: number;
  quantity: number;
}

export interface ResolvedCakeLineup {
  cakeName: string;
  lines: CakeOrderLine[];
  price: number;
}

export const SEED_CAKE_PRICES: CakePriceRow[] = [
  { cake_name: "HappySent Tårta", people_count: 8, price: 675, is_default: true },
  { cake_name: "HappySent Tårta", people_count: 12, price: 870, is_default: true },
  { cake_name: "HappySent Tårta", people_count: 15, price: 990, is_default: true },
  { cake_name: "HappySent Tårta", people_count: 20, price: 1195, is_default: true },
  { cake_name: "Budapestårta", people_count: 8, price: 675, is_default: false },
  { cake_name: "Budapestårta", people_count: 12, price: 870, is_default: false },
  { cake_name: "Budapestårta", people_count: 15, price: 990, is_default: false },
  { cake_name: "Jordgubbstårta", people_count: 8, price: 725, is_default: false },
  { cake_name: "Jordgubbstårta", people_count: 12, price: 910, is_default: false },
  { cake_name: "Jordgubbstårta", people_count: 15, price: 1045, is_default: false },
  { cake_name: "Jordgubbstårta", people_count: 20, price: 1260, is_default: false },
  { cake_name: "Chokladtrippel", people_count: 6, price: 595, is_default: false },
  { cake_name: "Chokladtrippel", people_count: 8, price: 675, is_default: false },
  { cake_name: "Chokladtrippel", people_count: 12, price: 870, is_default: false },
  { cake_name: "Hallontårta", people_count: 8, price: 675, is_default: false },
  { cake_name: "Hallontårta", people_count: 12, price: 870, is_default: false },
  { cake_name: "Hallontårta", people_count: 15, price: 990, is_default: false },
  { cake_name: "Hallontårta", people_count: 20, price: 1195, is_default: false },
  { cake_name: "Princesstårta", people_count: 8, price: 675, is_default: false },
  { cake_name: "Princesstårta", people_count: 12, price: 870, is_default: false },
  { cake_name: "Princesstårta", people_count: 15, price: 990, is_default: false },
  { cake_name: "Princesstårta", people_count: 20, price: 1195, is_default: false },
  { cake_name: "Schwarzwaldtårta", people_count: 8, price: 675, is_default: false },
  { cake_name: "Schwarzwaldtårta", people_count: 12, price: 870, is_default: false },
  { cake_name: "Schwarzwaldtårta", people_count: 15, price: 990, is_default: false },
  { cake_name: "Lyxprincesstårta", people_count: 8, price: 725, is_default: false },
  { cake_name: "Lyxprincesstårta", people_count: 12, price: 910, is_default: false },
  { cake_name: "Lyxprincesstårta", people_count: 15, price: 1045, is_default: false },
  { cake_name: "Lyxprincesstårta", people_count: 20, price: 1260, is_default: false },
  { cake_name: "Jordgubb & Rabarbertårta", people_count: 6, price: 595, is_default: false },
  { cake_name: "Jordgubb & Rabarbertårta", people_count: 8, price: 675, is_default: false },
  { cake_name: "Jordgubb & Rabarbertårta", people_count: 12, price: 870, is_default: false },
];

export function pickPeopleCountForActiveEmployees(
  sizes: number[],
  activeEmployeeCount: number,
): number {
  const lines = resolveCakeLineup(sizes, activeEmployeeCount);
  return lines[0]?.peopleCount ?? sizes.sort((a, b) => a - b)[0];
}

/** Pack cakes: max-size steps, then smallest size that fits the remainder. */
export function resolveCakeLineup(
  sizes: number[],
  headcount: number,
): CakeOrderLine[] {
  const sorted = [...sizes].sort((a, b) => a - b);
  if (sorted.length === 0) {
    throw new Error("Tårtan saknar prisstorlekar.");
  }

  const maxSize = sorted[sorted.length - 1];
  let remaining = Math.max(1, headcount);
  const lines: CakeOrderLine[] = [];

  const addCake = (peopleCount: number) => {
    const line = lines.find((entry) => entry.peopleCount === peopleCount);
    if (line) line.quantity += 1;
    else lines.push({ peopleCount, quantity: 1 });
  };

  while (remaining > maxSize) {
    addCake(maxSize);
    remaining -= maxSize;
  }

  const fitSize = sorted.find((size) => size >= remaining) ?? maxSize;
  addCake(fitSize);

  return lines;
}

/** @deprecated Prefer resolveCakeLineup — returns first line only. */
export function resolveFallbackCakeLineup(
  sizes: number[],
  activeEmployeeCount: number,
): { peopleCount: number; quantity: number } {
  const lines = resolveCakeLineup(sizes, activeEmployeeCount);
  return {
    peopleCount: lines[0].peopleCount,
    quantity: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
}

export function totalCakeQuantity(lines: CakeOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function formatCakeOrderLines(
  cakeName: string,
  lines: CakeOrderLine[],
): string {
  const parts = lines.map((line) =>
    line.quantity > 1
      ? `${line.quantity}×${line.peopleCount} pers.`
      : `${line.peopleCount} pers.`,
  );
  return `${cakeName}: ${parts.join(" + ")}`;
}

export function formatCakeOrderLabel(args: {
  cakeName: string;
  peopleCount: number;
  quantity: number;
}): string {
  return formatCakeOrderLines(args.cakeName, [
    { peopleCount: args.peopleCount, quantity: args.quantity },
  ]);
}

export function resolvePriceFromRows(
  rows: CakePriceRow[],
  cakeName: string,
  peopleCount: number,
): number {
  const row = rows.find(
    (r) => r.cake_name === cakeName && r.people_count === peopleCount,
  );
  if (!row) {
    throw new Error(`Ogiltig tårtkombination: ${cakeName}, ${peopleCount} pers.`);
  }
  return row.price;
}

export function resolveCakePriceForHeadcount(
  rows: CakePriceRow[],
  cakeName: string,
  headcount: number,
): ResolvedCakeLineup {
  const sizes = rows
    .filter((row) => row.cake_name === cakeName)
    .map((row) => row.people_count);

  if (sizes.length === 0) {
    throw new Error(`Tårttypen saknar priser: ${cakeName}`);
  }

  const lines = resolveCakeLineup(sizes, headcount);
  const price = lines.reduce(
    (sum, line) =>
      sum + resolvePriceFromRows(rows, cakeName, line.peopleCount) * line.quantity,
    0,
  );

  return { cakeName, lines, price };
}

export function resolveFallbackCakePrice(
  rows: CakePriceRow[],
  activeEmployeeCount: number,
): ResolvedCakeLineup {
  const defaultName =
    rows.find((row) => row.is_default)?.cake_name ?? DEFAULT_CAKE_NAME;
  return resolveCakePriceForHeadcount(rows, defaultName, activeEmployeeCount);
}

export function cakeLinesToDbJson(
  lines: CakeOrderLine[],
): { people_count: number; quantity: number }[] {
  return lines.map((line) => ({
    people_count: line.peopleCount,
    quantity: line.quantity,
  }));
}

export function cakeLinesFromDbJson(
  value: unknown,
): CakeOrderLine[] | null {
  if (!Array.isArray(value)) return null;
  const lines: CakeOrderLine[] = [];
  for (const entry of value) {
    if (
      entry &&
      typeof entry === "object" &&
      "people_count" in entry &&
      "quantity" in entry
    ) {
      const peopleCount = Number(entry.people_count);
      const quantity = Number(entry.quantity);
      if (
        Number.isInteger(peopleCount) &&
        peopleCount > 0 &&
        Number.isInteger(quantity) &&
        quantity > 0
      ) {
        lines.push({ peopleCount, quantity });
      }
    }
  }
  return lines.length > 0 ? lines : null;
}

export interface CakePriceDisplayGroup {
  cakeName: string;
  isDefault: boolean;
  sizes: { peopleCount: number; price: number }[];
}

export function groupCakePricesForDisplay(
  rows: CakePriceRow[],
): CakePriceDisplayGroup[] {
  const byName = new Map<string, CakePriceDisplayGroup>();

  for (const row of rows) {
    const existing = byName.get(row.cake_name);
    if (existing) {
      existing.sizes.push({ peopleCount: row.people_count, price: row.price });
      existing.isDefault = existing.isDefault || row.is_default;
    } else {
      byName.set(row.cake_name, {
        cakeName: row.cake_name,
        isDefault: row.is_default,
        sizes: [{ peopleCount: row.people_count, price: row.price }],
      });
    }
  }

  return [...byName.values()]
    .map((group) => ({
      ...group,
      sizes: [...group.sizes].sort((a, b) => a.peopleCount - b.peopleCount),
    }))
    .sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return a.cakeName.localeCompare(b.cakeName, "sv");
    });
}

export function minMaxCakePrice(rows: CakePriceRow[]): {
  min: number;
  max: number;
} {
  const prices = rows.map((r) => r.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
