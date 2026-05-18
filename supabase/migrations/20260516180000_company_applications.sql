-- Kö för nya företag som anmält sig via kontaktformuläret (innan admin godkänner).

create table public.company_applications (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  company_name text not null,
  contact_email text not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  processed_at timestamptz,
  created_company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now()
);

create index company_applications_pending_created_idx
  on public.company_applications (created_at desc)
  where status = 'pending';

alter table public.company_applications enable row level security;

create policy company_applications_admin_all
  on public.company_applications
  for all
  to authenticated
  using (true)
  with check (true);

-- Inserts från marketing sker med service role (samma mönster som contact_rate_limits).
