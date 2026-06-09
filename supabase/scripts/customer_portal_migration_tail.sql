-- Kör detta i Supabase SQL Editor om 20260603120000_customer_portal.sql
-- avbröts vid "relation public.logs does not exist".
-- Säker att köra flera gånger (IF NOT EXISTS / DROP IF EXISTS).

-- employees, companies, orders, products — admin + företagsanvändare
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
