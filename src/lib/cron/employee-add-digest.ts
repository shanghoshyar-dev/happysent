import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmployeeChangesDigest } from "@/lib/resend/templates";
import { todayInStockholm, toDateString } from "@/lib/holidays/swedish";

/** Rad i employee_add_digest.additions (JSON). */
export type DigestChangeEntry = {
  kind: "add" | "remove";
  first_name: string;
  last_name: string;
  birthday?: string | null;
  personal_number?: string | null;
};

function normalizeEntry(raw: unknown): DigestChangeEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const first_name = String(o.first_name ?? "").trim();
  const last_name = String(o.last_name ?? "").trim();
  if (!first_name || !last_name) return null;
  const kind = o.kind === "remove" ? "remove" : "add";
  const birthday =
    typeof o.birthday === "string" && o.birthday.trim() !== ""
      ? o.birthday.trim()
      : null;
  const personal_number =
    typeof o.personal_number === "string" && o.personal_number.trim() !== ""
      ? o.personal_number.trim()
      : null;
  return {
    kind,
    first_name,
    last_name,
    birthday,
    personal_number,
  };
}

export async function findCompanyIdForContactMatch(params: {
  companyName: string;
  address: string;
  city: string;
}): Promise<string | null> {
  const supabase = createAdminClient();
  const name = params.companyName.trim();
  const address = params.address.trim();
  const city = params.city.trim();
  if (!name || !address || !city) return null;

  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .ilike("name", name)
    .ilike("address", address)
    .ilike("city", city)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[employee-add-digest] company lookup failed:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function appendEmployeeAddDigestEntries(
  companyId: string,
  entries: DigestChangeEntry[],
): Promise<void> {
  if (entries.length === 0) return;

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
  const merged = [...prev, ...entries];

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
 * Skickar digest för gårdagens bucket (digest_date &lt; idag Stockholm).
 * En kombinerad mejl med tillagda och borttagna anställda.
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
    const entries = parseAdditions(row.additions);
    if (entries.length === 0) {
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
      await sendEmployeeChangesDigest({
        to: company.contact_email,
        companyName: company.name,
        digestDateIso: row.digest_date,
        entries: entries.map((e) => ({
          kind: e.kind,
          first_name: e.first_name,
          last_name: e.last_name,
          birthday: e.birthday ?? null,
          personal_number: e.personal_number ?? null,
        })),
      });
      const { error: upErr } = await supabase
        .from("employee_add_digest")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", row.id);
      if (upErr) {
        result.errors.push(
          `Digest ${row.id}: kunde inte markera som skickad: ${upErr.message}`,
        );
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

function parseAdditions(raw: unknown): DigestChangeEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: DigestChangeEntry[] = [];
  for (const item of raw) {
    const n = normalizeEntry(item);
    if (n) out.push(n);
  }
  return out;
}
