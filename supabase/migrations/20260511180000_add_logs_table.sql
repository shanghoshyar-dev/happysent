-- Persistent application log for cron failures and other system events.
-- Inserted into by the admin (service-role) client only; never by end users.

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('info', 'warn', 'error')),
  context text not null,
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists logs_created_at_idx
  on public.logs (created_at desc);

create index if not exists logs_level_idx
  on public.logs (level);

alter table public.logs enable row level security;

-- No public access — only the service role bypasses RLS and can write/read.
-- Authenticated admin sessions read via server routes that use the service role.
