"use server";

import { revalidatePath } from "next/cache";

import { fetchEmployeeChangeRequestById } from "@/lib/admin/employee-change-requests";
import { findCompanyIdForContactMatch } from "@/lib/cron/employee-add-digest";
import {
  errorMentionsColumn,
  isMissingColumnError,
} from "@/lib/supabase/db-errors";
import { createClient } from "@/lib/supabase/server";

export type QueueActionResult = { ok: true } | { ok: false; error: string };

export async function rejectEmployeeChangeRequest(
  id: string,
): Promise<QueueActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("employee_change_requests")
    .update({
      status: "rejected",
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/kolista");
  return { ok: true };
}

export async function approveEmployeeChangeRequest(
  id: string,
  companyIdOverride?: string,
): Promise<QueueActionResult> {
  const supabase = createClient();
  const request = await fetchEmployeeChangeRequestById(supabase, id);
  if (!request) {
    return {
      ok: false,
      error: "Förfrågan finns inte eller är redan hanterad.",
    };
  }

  const companyId =
    companyIdOverride?.trim() ||
    request.matched_company_id ||
    (await findCompanyIdForContactMatch({
      companyName: request.company_name,
      address: request.address,
      city: request.city,
    }));

  if (!companyId) {
    return {
      ok: false,
      error:
        "Kunde inte matcha företaget automatiskt. Öppna «Godkänn…» och välj rätt företag.",
    };
  }

  const employees = request.employees;
  if (employees.length === 0) {
    return { ok: false, error: "Inga anställda i förfrågan." };
  }

  if (request.action_type === "add") {
    const numberOfPeople = request.number_of_people ?? 10;
    const rows = employees.map((e) => ({
      company_id: companyId,
      first_name: e.first_name,
      last_name: e.last_name,
      birthday: e.birthday,
      number_of_people: numberOfPeople,
      celebration_frequency: "every_year" as const,
      gift_type: "cake" as const,
      is_active: true as const,
    }));

    let { error } = await supabase.from("employees").insert(rows);

    if (
      error &&
      isMissingColumnError(error) &&
      (errorMentionsColumn(error, "celebration_frequency") ||
        errorMentionsColumn(error, "gift_type"))
    ) {
      const legacy = rows.map(
        ({
          celebration_frequency: _cf,
          gift_type: _gt,
          ...rest
        }) => rest,
      );
      const retry = await supabase.from("employees").insert(legacy);
      error = retry.error;
    }

    if (error) return { ok: false, error: error.message };
  } else {
    for (const e of employees) {
      const { data: match, error: findErr } = await supabase
        .from("employees")
        .select("id")
        .eq("company_id", companyId)
        .eq("birthday", e.birthday)
        .ilike("first_name", e.first_name)
        .ilike("last_name", e.last_name)
        .limit(1)
        .maybeSingle();

      if (findErr) return { ok: false, error: findErr.message };
      if (!match) {
        return {
          ok: false,
          error: `Hittade ingen aktiv anställd: ${e.first_name} ${e.last_name} (${e.birthday}).`,
        };
      }

      const { error: upErr } = await supabase
        .from("employees")
        .update({ is_active: false })
        .eq("id", match.id);

      if (upErr) return { ok: false, error: upErr.message };
    }
  }

  const { error: markErr } = await supabase
    .from("employee_change_requests")
    .update({
      status: "approved",
      processed_at: new Date().toISOString(),
      matched_company_id: companyId,
    })
    .eq("id", id)
    .eq("status", "pending");

  if (markErr) return { ok: false, error: markErr.message };

  revalidatePath("/admin/kolista");
  revalidatePath("/admin/anstallda");
  revalidatePath("/admin/foretag");
  return { ok: true };
}
