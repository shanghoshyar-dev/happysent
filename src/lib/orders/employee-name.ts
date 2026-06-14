export function orderEmployeeDisplayName(order: {
  employee_first_name?: string | null;
  employee_last_name?: string | null;
  employees?: { first_name: string; last_name: string } | null;
}): string {
  const emp = order.employees;
  if (emp) {
    return `${emp.first_name} ${emp.last_name}`.trim();
  }
  const first = order.employee_first_name?.trim();
  const last = order.employee_last_name?.trim();
  if (first || last) {
    return `${first ?? ""} ${last ?? ""}`.trim();
  }
  return "—";
}
