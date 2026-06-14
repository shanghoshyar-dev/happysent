-- Fixed cake pricing by type and size (SEK incl 6% VAT).

create table public.cake_prices (
  id uuid primary key default gen_random_uuid(),
  cake_name text not null,
  people_count int not null check (people_count > 0),
  price int not null check (price >= 0),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (cake_name, people_count)
);

create index cake_prices_cake_name_idx on public.cake_prices (cake_name);
create index cake_prices_default_idx on public.cake_prices (is_default) where is_default;

insert into public.cake_prices (cake_name, people_count, price, is_default) values
  ('HappySent Tårta', 8, 675, true),
  ('HappySent Tårta', 12, 870, true),
  ('HappySent Tårta', 15, 990, true),
  ('HappySent Tårta', 20, 1195, true),
  ('Budapestårta', 8, 675, false),
  ('Budapestårta', 12, 870, false),
  ('Budapestårta', 15, 990, false),
  ('Jordgubbstårta', 8, 725, false),
  ('Jordgubbstårta', 12, 910, false),
  ('Jordgubbstårta', 15, 1045, false),
  ('Jordgubbstårta', 20, 1260, false),
  ('Chokladtrippel', 6, 595, false),
  ('Chokladtrippel', 8, 675, false),
  ('Chokladtrippel', 12, 870, false),
  ('Hallontårta', 8, 675, false),
  ('Hallontårta', 12, 870, false),
  ('Hallontårta', 15, 990, false),
  ('Hallontårta', 20, 1195, false),
  ('Princesstårta', 8, 675, false),
  ('Princesstårta', 12, 870, false),
  ('Princesstårta', 15, 990, false),
  ('Princesstårta', 20, 1195, false),
  ('Schwarzwaldtårta', 8, 675, false),
  ('Schwarzwaldtårta', 12, 870, false),
  ('Schwarzwaldtårta', 15, 990, false),
  ('Lyxprincesstårta', 8, 725, false),
  ('Lyxprincesstårta', 12, 910, false),
  ('Lyxprincesstårta', 15, 1045, false),
  ('Lyxprincesstårta', 20, 1260, false),
  ('Jordgubb & Rabarbertårta', 6, 595, false),
  ('Jordgubb & Rabarbertårta', 8, 675, false),
  ('Jordgubb & Rabarbertårta', 12, 870, false);

alter table public.employees
  add column if not exists cake_name text,
  add column if not exists people_count int check (people_count is null or people_count > 0);

alter table public.orders
  add column if not exists cake_name text,
  add column if not exists people_count int check (people_count is null or people_count > 0);

alter table public.companies
  drop column if exists price_per_cake;

alter table public.app_settings
  drop column if exists default_price_per_cake;

alter table public.cake_prices enable row level security;

drop policy if exists cake_prices_admin_all on public.cake_prices;
create policy cake_prices_admin_all
  on public.cake_prices
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists cake_prices_company_select on public.cake_prices;
create policy cake_prices_company_select
  on public.cake_prices
  for select
  to authenticated
  using (public.current_company_id() is not null or public.is_admin());

grant select on table public.cake_prices to authenticated;

comment on table public.cake_prices is
  'Fixed cake prices in SEK incl 6% VAT, by cake type and party size.';
comment on column public.employees.cake_name is
  'Optional pricing preference — which cake type to bill.';
comment on column public.employees.people_count is
  'Optional pricing preference — party size for billing (not delivery dept size).';
