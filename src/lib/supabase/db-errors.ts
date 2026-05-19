/** PostgREST/Postgres när en kolumn saknas i databasen. */
export function isMissingColumnError(error: {
  message?: string;
  code?: string;
}): boolean {
  const msg = (error.message ?? "").toLowerCase();
  const code = String(error.code ?? "");
  if (code === "42703") return true;
  if (msg.includes("schema cache")) return true;
  if (msg.includes("could not find")) return true;
  return (
    msg.includes("column") &&
    (msg.includes("does not exist") || msg.includes("unknown column"))
  );
}

export function errorMentionsColumn(
  error: { message?: string },
  column: string,
): boolean {
  return (error.message ?? "").toLowerCase().includes(column.toLowerCase());
}
