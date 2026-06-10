/**
 * Skicka om kundportal-inbjudan från terminal.
 * Usage: node scripts/resend-portal-invite.mjs [companyId|company-name-search]
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function getAuthSiteUrl() {
  const explicit = process.env.AUTH_SITE_URL?.trim();
  if (explicit?.startsWith("http")) return explicit.replace(/\/+$/, "");
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const site =
    raw?.startsWith("http") ? raw.replace(/\/+$/, "") : "https://happysent.com";
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(site)) {
    if (process.env.ALLOW_LOCALHOST_AUTH !== "1") return "https://happysent.com";
  }
  return site;
}

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw?.startsWith("http")) return raw.replace(/\/+$/, "");
  return "https://happysent.com";
}

async function createPortalInviteLink(admin, email, companyId) {
  const redirectTo = `${getAuthSiteUrl()}/auth/callback?next=/kund/aktivera`;

  function buildActivateUrl(properties) {
    if (!properties?.hashed_token || !properties.verification_type) return null;
    const url = new URL(redirectTo);
    url.searchParams.set("token_hash", properties.hashed_token);
    url.searchParams.set("type", properties.verification_type);
    return url.toString();
  }

  const invite = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: { company_id: companyId }, redirectTo },
  });

  const inviteLink = buildActivateUrl(invite.data?.properties);
  if (!invite.error && inviteLink) return { ok: true, actionLink: inviteLink };

  const msg = invite.error?.message ?? "";
  if (/already|registered|exists/i.test(msg)) {
    const recovery = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });
    const recoveryLink = buildActivateUrl(recovery.data?.properties);
    if (!recovery.error && recoveryLink) return { ok: true, actionLink: recoveryLink };
    return { ok: false, error: recovery.error?.message ?? "Recovery link failed" };
  }

  return { ok: false, error: msg || "Invite link failed" };
}

async function main() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? "info@happysent.com";

  if (!supabaseUrl || !serviceKey || !resendKey) {
    throw new Error("Saknar NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY eller RESEND_API_KEY i .env.local");
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const resend = new Resend(resendKey);

  const arg = process.argv[2]?.trim();
  let company;

  if (arg && /^[0-9a-f-]{36}$/i.test(arg)) {
    const { data, error } = await admin
      .from("companies")
      .select("id, name, contact_email")
      .eq("id", arg)
      .maybeSingle();
    if (error) throw error;
    company = data;
  } else {
    const search = arg || "svarttaxi";
    const { data, error } = await admin
      .from("companies")
      .select("id, name, contact_email, portal_invite_sent_at")
      .ilike("name", `%${search}%`)
      .order("portal_invite_sent_at", { ascending: false, nullsFirst: false })
      .limit(5);
    if (error) throw error;
    if (!data?.length) throw new Error(`Inget företag hittades för "${search}"`);
    company = data[0];
    if (data.length > 1) {
      console.log("Flera träffar, använder:", data.map((c) => `${c.name} (${c.id})`).join(", "));
    }
  }

  if (!company) throw new Error("Företaget hittades inte.");
  const email = company.contact_email?.trim();
  if (!email) throw new Error(`${company.name} saknar contact_email.`);

  console.log(`Skickar inbjudan till ${email} (${company.name})…`);

  const linkResult = await createPortalInviteLink(admin, email, company.id);
  if (!linkResult.ok) throw new Error(linkResult.error);

  console.log("Länk i mejlet:", linkResult.actionLink);

  const loginUrl = `${getSiteUrl()}/kund/login`;
  const text =
    `Hej ${company.name}!\n\n` +
    `Ni är inbjudna till HappySent kundportal där ni kan hantera era anställda och se kommande födelsedagar.\n\n` +
    `Aktivera kontot och välj lösenord (länken gäller begränsad tid):\n` +
    `${linkResult.actionLink}\n\n` +
    `När kontot är aktiverat loggar ni in här:\n` +
    `${loginUrl}\n\n` +
    `Har ni frågor? Mejla ${adminEmail}\n\n` +
    `Hälsningar,\nHappySent`;

  const { error: mailErr } = await resend.emails.send({
    from: `HappySent <${adminEmail}>`,
    to: email,
    subject: "Inbjudan till HappySent kundportal – aktivera konto",
    text,
  });
  if (mailErr) throw mailErr;

  await admin.from("company_portal_invites").upsert(
    {
      company_id: company.id,
      email,
      invited_at: new Date().toISOString(),
      accepted_at: null,
    },
    { onConflict: "company_id,email" },
  );

  await admin
    .from("companies")
    .update({ portal_invite_sent_at: new Date().toISOString() })
    .eq("id", company.id);

  console.log("Klart! Mejl skickat.");
  console.log("Aktiveringslänk (redirect):", getAuthSiteUrl() + "/auth/callback?next=/kund/aktivera");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
