/** Static seed data — keep in sync with migration cake_prices inserts. */
export interface CakePriceRow {
  cake_name: string;
  people_count: number;
  price: number;
  is_default: boolean;
}

export const DEFAULT_CAKE_NAME = "HappySent Tårta";

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
  const sorted = [...sizes].sort((a, b) => a - b);
  if (sorted.length === 0) {
    throw new Error("Standardtårtan saknar prisstorlekar.");
  }
  const fit = sorted.find((size) => size >= activeEmployeeCount);
  return fit ?? sorted[sorted.length - 1];
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

export function resolveFallbackCakePrice(
  rows: CakePriceRow[],
  activeEmployeeCount: number,
): { cakeName: string; peopleCount: number; price: number } {
  const defaultName =
    rows.find((r) => r.is_default)?.cake_name ?? DEFAULT_CAKE_NAME;
  const defaultSizes = rows
    .filter((r) => r.cake_name === defaultName)
    .map((r) => r.people_count);
  const peopleCount = pickPeopleCountForActiveEmployees(
    defaultSizes,
    Math.max(1, activeEmployeeCount),
  );
  const price = resolvePriceFromRows(rows, defaultName, peopleCount);
  return { cakeName: defaultName, peopleCount, price };
}
