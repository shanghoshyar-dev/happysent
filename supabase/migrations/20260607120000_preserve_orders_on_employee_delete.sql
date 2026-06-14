-- Keep delivered/invoiced orders when an employee is deleted (invoice history).

alter table public.orders
  add column if not exists employee_first_name text,
  add column if not exists employee_last_name text;

update public.orders o
set
  employee_first_name = e.first_name,
  employee_last_name = e.last_name
from public.employees e
where o.employee_id = e.id
  and (o.employee_first_name is null or o.employee_last_name is null);

update public.orders
set
  employee_first_name = coalesce(nullif(trim(employee_first_name), ''), '—'),
  employee_last_name = coalesce(employee_last_name, '');

alter table public.orders
  alter column employee_first_name set not null,
  alter column employee_last_name set not null;

alter table public.orders
  alter column employee_id drop not null;

alter table public.orders
  drop constraint if exists orders_employee_id_fkey;

alter table public.orders
  add constraint orders_employee_id_fkey
  foreign key (employee_id) references public.employees (id) on delete set null;

drop index if exists public.orders_employee_delivery_unique;

create unique index orders_employee_delivery_unique
  on public.orders (employee_id, delivery_date)
  where employee_id is not null;

comment on column public.orders.employee_first_name is
  'Snapshot at order creation; shown on invoices if employee is deleted.';
comment on column public.orders.employee_last_name is
  'Snapshot at order creation; shown on invoices if employee is deleted.';

-- Kundportal: allow deleting future orders when removing an employee.
drop policy if exists orders_company_delete on public.orders;
create policy orders_company_delete
  on public.orders
  for delete
  to authenticated
  using (
    company_id = public.current_company_id()
    and status not in ('delivered', 'invoiced')
  );
