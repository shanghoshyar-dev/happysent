import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmployeeAdditionsDigest } from "@/lib/resend/templates";
import { todayInStockholm, toDateString } from "@/lib/holidays/swedish";

export interface DigestAddition {
  first_name: string;
  last_name: string;
}

export async function appendEmployeeAddDigestEntries(
  companyId: string,
  names: DigestAddition[],
): Promise<void> {
  if (names.length === 0) return;

  const digestDate = toDateString(todayInStockholm());
  const supabase = createAdminClient();

  const { data: existing, error: selErr } = await supabase
    .from("employee_add_digest")
    .select("additions, notified_at")
    .eq("company_id", companyId)
    .eq("digest_date", digestDate)
    .maybeSingle();

  if (selErr) {
    console.error("[employee-add-digest] select failed:", selErr.message);
    return;
  }

  if (existing?.notified_at) {
    console.warn(
      "[employee-add-digest] bucket already notified for date — skipping append",
      companyId,
      digestDate,
    );
    return;
  }

  const prev = parseAdditions(existing?.additions);
  const merged = [...prev, ...names];

  const { error: upsertErr } = await supabase.from("employee_add_digest").upsert(
    {
      company_id: companyId,
      digest_date: digestDate,
      additions: merged as unknown as never,
      notified_at: null,
    },
    { onConflict: "company_id,digest_date" },
  );

  if (upsertErr) {
    console.error("[employee-add-digest] upsert failed:", upsertErr.message);
  }
}

export interface FlushEmployeeDigestResult {
  digestsSent: number;
  digestsSkippedEmpty: number;
  errors: string[];
}

/**
 * Email digests for any pending buckets strictly before today's Stockholm date.
 * Called from the 07:00 cron so "yesterday's" bulk registrations become one mail per company.
 */
export async function flushPendingEmployeeAddDigests(
  today: Date,
): Promise<FlushEmployeeDigestResult> {
  const todayIso = toDateString(today);
  const supabase = createAdminClient();
  const result: FlushEmployeeDigestResult = {
    digestsSent: 0,
    digestsSkippedEmpty: 0,
    errors: [],
  };

  const { data: pending, error } = await supabase
    .from("employee_add_digest")
    .select(
      `id, company_id, digest_date, additions,
       companies:company_id ( name, contact_email )`,
    )
    .is("notified_at", null)
    .lt("digest_date", todayIso);

  if (error) {
    result.errors.push(error.message);
    return result;
  }

  for (const row of pending ?? []) {
    const names = parseAdditions(row.additions);
    if (names.length === 0) {
      result.digestsSkippedEmpty++;
      await supabase
        .from("employee_add_digest")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", row.id);
      continue;
    }

    const company = (
      row as unknown as {
        companies: { name: string; contact_email: string } | null;
      }
    ).companies;
    if (!company?.contact_email) {
      result.errors.push(`Digest ${row.id}: saknar kontaktmejl för företag`);
      continue;
    }

    try {
      await sendEmployeeAdditionsDigest({
        to: company.contact_email,
        companyName: company.name,
        digestDateIso: row.digest_date,
        names,
      });
      const { error: upErr } = await supabase
        .from("employee_add_digest")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", row.id);
      if (upErr) {
        result.errors.push(`Digest ${row.id}: kunde inte markera som skickad: ${upErr.message}`);
      } else {
        result.digestsSent++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Digest ${row.id}: ${msg}`);
    }
  }

  return result;
}

function parseAdditions(raw: unknown): DigestAddition[] {
  if (!Array.isArray(raw)) return [];
  const out: DigestAddition[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      "first_name" in item &&
      "last_name" in item
    ) {
      out.push({
        first_name: String((item as DigestAddition).first_name ?? ""),
        last_name: String((item as DigestAddition).last_name ?? ""),
      });
    }
  }
  return out;
}
