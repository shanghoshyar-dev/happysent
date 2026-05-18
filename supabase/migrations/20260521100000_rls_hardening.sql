-- RLS-härdning: explicit policies där RLS redan är på men roller saknat regler,
-- samt minimerade privilegier för känsliga tabeller.
--
-- Anon ska bara nå public.blog_posts (publicerade) och public.products (aktiva)
-- via befintliga policies — inte övriga tabeller.

-- ---------------------------------------------------------------------------
-- employee_add_digest: RLS fanns utan policy → bara service_role kunde läsa/skriva.
-- Lägg samma admin-mönster som bakeries/companies så server-side inloggad admin fungerar.
-- ---------------------------------------------------------------------------
drop policy if exists employee_add_digest_admin_all on public.employee_add_digest;

create policy employee_add_digest_admin_all
  on public.employee_add_digest
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on table public.employee_add_digest to authenticated;

comment on table public.employee_add_digest is
  'Personaländringsdigest. RLS: authenticated full åtkomst för admin-appen; service_role används i cron/digest-kod.';

-- ---------------------------------------------------------------------------
-- logs: infogn sker med service_role i kodbasen — gör INSERT uttryckligen otillåten
-- för anon/authenticated; SELECT för inloggad admin vid felsökning/listning.
-- ---------------------------------------------------------------------------
revoke all on table public.logs from anon;

drop policy if exists logs_authenticated_select on public.logs;

create policy logs_authenticated_select
  on public.logs
  for select
  to authenticated
  using (true);

grant select on table public.logs to authenticated;
revoke insert, update, delete on table public.logs from authenticated;

comment on table public.logs is
  'System-/cronloggar. INSERT/UPDATE/DELETE endast via service_role (RLS saknar write-policies för authenticated). SELECT tillåten för authenticated.';

-- ---------------------------------------------------------------------------
-- contact_rate_limits: inga policies (avsiktligt) — bara service_role.
-- Säkerställ att anon inte har tabellprivilegier.
-- ---------------------------------------------------------------------------
revoke all on table public.contact_rate_limits from anon;
revoke all on table public.contact_rate_limits from authenticated;

comment on table public.contact_rate_limits is
  'Rate limit (hashade nycklar). RLS utan policies: endast service_role når tabellen.';

-- OBS: Storage-bucket company_application_uploads ska sakna SELECT/INSERT-policies för
-- anon och authenticated — åtkomst endast via service_role i serverkod (som idag).
-- Verifiera under Supabase Dashboard → Storage → Policies om ni lägger till fler buckets.
