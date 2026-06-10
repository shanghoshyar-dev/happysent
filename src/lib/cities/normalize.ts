/** Jämför stad utan skilja på versaler eller å/ä/ö (Malmö = Malmo). */
export function cityKey(city: string): string {
  return city
    .trim()
    .toLocaleLowerCase("sv-SE")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function citiesMatch(a: string, b: string): boolean {
  return cityKey(a) === cityKey(b);
}
