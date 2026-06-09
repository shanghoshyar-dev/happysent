-- Kundportal (F): admin_users, company_users, RLS per företag.

-- ---------------------------------------------------------------------------
-- Tabeller
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.company_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, company_id)
);

create index if not exists company_users_user_idx on public.company_users (user_id);
create index if not exists company_users_company_idx on public.company_users (company_id);

create table if not exists public.company_portal_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (company_id, email)
);

alter table public.companies
  add column if not exists portal_invite_sent_at timestamptz;

comment on table public.admin_users is
  'HappySent-administratörer. Endast dessa får /admin efter RLS-härdning.';
comment on table public.company_users is
  'HR/inloggning kopplad till ett företag (/kund).';
comment on column public.companies.portal_invite_sent_at is
  'När inbjudan till kundportalen skickades till contact_email.';

-- ---------------------------------------------------------------------------
-- Hjälpfunktioner (security definer)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id
  from public.company_users
  where user_id = auth.uid()
  order by created_at
  limit 1;
$$;

create or replace function public.is_company_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_company_id() is not null;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_company_id() to authenticated;
grant execute on function public.is_company_user() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS nya tabeller
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.company_users enable row level security;
alter table public.company_portal_invites enable row level security;

drop policy if exists admin_users_admin_all on public.admin_users;
create policy admin_users_admin_all
  on public.admin_users
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists company_users_admin_all on public.company_users;
create policy company_users_admin_all
  on public.company_users
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists company_users_self_select on public.company_users;
create policy company_users_self_select
  on public.company_users
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists company_portal_invites_admin_all on public.company_portal_invites;
create policy company_portal_invites_admin_all
  on public.company_portal_invites
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on table public.admin_users to authenticated;
grant select, insert, update, delete on table public.company_users to authenticated;
grant select, insert, update, delete on table public.company_portal_invites to authenticated;

-- ---------------------------------------------------------------------------
-- Ersätt bred authenticated-åtkomst med is_admin() på admin-tabeller
-- (hoppar tabeller som saknas i prod, t.ex. logs om äldre migration ej körts)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'bakeries',
    'reminder_log',
    'invoices',
    'blog_posts',
    'florists',
    'company_applications',
    'app_settings',
    'employee_change_requests',
    'donation_contributions',
    'donation_campaign_snapshots',
    'employee_add_digest'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'drop policy if exists %I on public.%I',
        t || '_admin_all',
        t
      );
      execute format(
        'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
        t || '_admin_all',
        t
      );
    end if;
  end loop;

  if to_regclass('public.logs') is not null then
    drop policy if exists logs_authenticated_select on public.logs;
    execute $policy$
      create policy logs_authenticated_select
        on public.logs
        for select
        to authenticated
        using (public.is_admin())
    $policy$;
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- employees, companies, orders, products — admin + företagsanvändare
-- ---------------------------------------------------------------------------
drop policy if exists employees_admin_all on public.employees;
create policy employees_admin_all
  on public.employees
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists employees_company_select on public.employees;
create policy employees_company_select
  on public.employees
  for select
  to authenticated
  using (company_id = public.current_company_id());

drop policy if exists employees_company_insert on public.employees;
create policy employees_company_insert
  on public.employees
  for insert
  to authenticated
  with check (company_id = public.current_company_id());

drop policy if exists employees_company_update on public.employees;
create policy employees_company_update
  on public.employees
  for update
  to authenticated
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

drop policy if exists employees_company_delete on public.employees;
create policy employees_company_delete
  on public.employees
  for delete
  to authenticated
  using (company_id = public.current_company_id());

drop policy if exists companies_admin_all on public.companies;
create policy companies_admin_all
  on public.companies
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists companies_company_select on public.companies;
create policy companies_company_select
  on public.companies
  for select
  to authenticated
  using (id = public.current_company_id());

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all
  on public.orders
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists orders_company_select on public.orders;
create policy orders_company_select
  on public.orders
  for select
  to authenticated
  using (company_id = public.current_company_id());

drop policy if exists products_admin_all on public.products;
create policy products_admin_all
  on public.products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists products_company_select on public.products;
create policy products_company_select
  on public.products
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.companies c
      join public.bakeries b on b.id = public.products.bakery_id
      where c.id = public.current_company_id()
        and lower(trim(b.city)) = lower(trim(c.city))
    )
  );

-- blog_posts_public_read och products_public_read (anon) oförändrade.
