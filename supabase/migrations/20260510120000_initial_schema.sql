-- Happysent initial schema
-- Tables: bakeries, companies, employees, orders, reminder_log, invoices, products, blog_posts
-- Auth model: admin-only. RLS denies anon by default; authenticated users get full access.
-- The cron job uses the service-role client and bypasses RLS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- bakeries
-- ---------------------------------------------------------------------------
create table public.bakeries (
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

create index bakeries_city_idx on public.bakeries (city);

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
create table public.companies (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  address         text not null,
  city            text not null,
  contact_email   text not null,
  billing_email   text not null,
  bakery_id       uuid not null references public.bakeries(id) on delete restrict,
  price_per_cake  int  not null check (price_per_cake >= 0),
  status          text not null default 'active' check (status in ('active', 'paused')),
  created_at      timestamptz not null default now()
);

create index companies_bakery_idx on public.companies (bakery_id);
create index companies_status_idx on public.companies (status);

-- ---------------------------------------------------------------------------
-- employees
-- ---------------------------------------------------------------------------
create table public.employees (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references public.companies(id) on delete cascade,
  first_name       text not null,
  last_name        text not null,
  birthday         date not null,
  number_of_people int  not null default 1 check (number_of_people > 0),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create index employees_company_idx  on public.employees (company_id);
create index employees_birthday_idx on public.employees (birthday);
create index employees_active_idx   on public.employees (is_active);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.employees(id) on delete cascade,
  company_id    uuid not null references public.companies(id) on delete cascade,
  delivery_date date not null,
  status        text not null default 'scheduled'
                check (status in ('scheduled', 'sent_to_bakery', 'delivered', 'invoiced', 'cancelled')),
  price         int  not null check (price >= 0),
  created_at    timestamptz not null default now()
);

create index orders_employee_idx     on public.orders (employee_id);
create index orders_company_idx      on public.orders (company_id);
create index orders_delivery_idx     on public.orders (delivery_date);
create index orders_company_date_idx on public.orders (company_id, delivery_date);

-- One order per employee per delivery year (idempotent for cron)
create unique index orders_employee_year_unique
  on public.orders (employee_id, (extract(year from delivery_date)));

-- ---------------------------------------------------------------------------
-- reminder_log
-- ---------------------------------------------------------------------------
create table public.reminder_log (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  order_id    uuid not null references public.orders(id) on delete cascade,
  type        text not null check (type in ('14_days', '7_days_bakery', '7_days_company', '1_day', 'day_of')),
  sent_at     timestamptz not null default now()
);

create index reminder_log_employee_idx on public.reminder_log (employee_id);
create index reminder_log_order_idx    on public.reminder_log (order_id);

-- One reminder per (order, type) — guarantees we never email twice for the
-- same birthday cycle (since each delivery year has exactly one order).
create unique index reminder_log_order_type_unique
  on public.reminder_log (order_id, type);

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
create table public.invoices (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  month        text not null,
  total_amount int  not null check (total_amount >= 0),
  status       text not null default 'unpaid' check (status in ('unpaid', 'paid')),
  orders       jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

create index invoices_company_idx on public.invoices (company_id);
create index invoices_month_idx   on public.invoices (month);
create unique index invoices_company_month_unique on public.invoices (company_id, month);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id        uuid primary key default gen_random_uuid(),
  name      text not null unique,
  is_active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------
create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  content      text not null,
  published_at timestamptz,
  author       text not null,
  is_published boolean not null default false
);

create index blog_posts_published_idx on public.blog_posts (is_published, published_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.bakeries     enable row level security;
alter table public.companies    enable row level security;
alter table public.employees    enable row level security;
alter table public.orders       enable row level security;
alter table public.reminder_log enable row level security;
alter table public.invoices     enable row level security;
alter table public.products     enable row level security;
alter table public.blog_posts   enable row level security;

-- Authenticated admin gets full access on every table
do $$
declare
  t text;
begin
  foreach t in array array[
    'bakeries','companies','employees','orders',
    'reminder_log','invoices','products','blog_posts'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true);',
      t || '_admin_all', t
    );
  end loop;
end$$;

-- Public read of published blog posts (for the marketing site)
create policy blog_posts_public_read
  on public.blog_posts
  for select
  to anon
  using (is_published = true);

-- Public read of active products (used on marketing site, e.g. pricing page)
create policy products_public_read
  on public.products
  for select
  to anon
  using (is_active = true);
