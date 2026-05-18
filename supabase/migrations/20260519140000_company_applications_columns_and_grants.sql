-- Idempotent: säkerställ kolumner och privilegier för company_applications
-- så att inserts från servern (Supabase service_role) och admin (authenticated) fungerar.
--
-- Kör mot produktion via: Supabase Dashboard → SQL → New query, eller `supabase db push`.

alter table public.company_applications
  add column if not exists contact_phone text;

alter table public.company_applications
  add column if not exists terms_accepted_at timestamptz;

alter table public.company_applications
  add column if not exists terms_document_version text;

update public.company_applications
set terms_document_version = 'May 2026'
where terms_document_version is null
   or trim(terms_document_version) = '';

alter table public.company_applications
  alter column terms_document_version set default 'May 2026';

alter table public.company_applications
  alter column terms_document_version set not null;

grant usage on schema public to service_role;

grant all on table public.company_applications to postgres;
grant all on table public.company_applications to service_role;

grant select, insert, update, delete on table public.company_applications to authenticated;
