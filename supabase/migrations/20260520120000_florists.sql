-- Blomsterbutiker (partner för produkten Blommor) + koppling på företag.

create table public.florists (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  city          text not null,
  opening_hours text,
  days_notice   int  not null default 7,
  notes         text,
  created_at    timestamptz not null default now()
);

create index florists_city_idx on public.florists (city);

alter table public.companies
  add column if not exists offers_flowers boolean not null default false;

alter table public.companies
  add column if not exists florist_id uuid references public.florists(id) on delete restrict;

create index if not exists companies_florist_idx on public.companies (florist_id);

alter table public.companies
  drop constraint if exists companies_flowers_require_florist;

alter table public.companies
  add constraint companies_flowers_require_florist
  check (not offers_flowers or florist_id is not null);

alter table public.florists enable row level security;

create policy florists_admin_all
  on public.florists
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on table public.florists to authenticated;
grant all on table public.florists to service_role;
