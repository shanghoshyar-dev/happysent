-- One row per company per Stockholm calendar day: accumulate new employees,
-- then send a single digest email (next morning cron) instead of N separate mails.

create table if not exists public.employee_add_digest (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  digest_date date not null,
  additions jsonb not null default '[]'::jsonb,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, digest_date)
);

create index if not exists employee_add_digest_pending_idx
  on public.employee_add_digest (digest_date)
  where notified_at is null;

alter table public.employee_add_digest enable row level security;
