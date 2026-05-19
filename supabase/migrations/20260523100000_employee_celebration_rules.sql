-- Per-employee celebration frequency and gift type; orders track gift_type.

alter table public.companies
  add column if not exists price_per_flowers int check (price_per_flowers is null or price_per_flowers >= 0);

alter table public.employees
  add column if not exists celebration_frequency text not null default 'every_year'
    check (celebration_frequency in ('every_year', 'twice_yearly', 'decade'));

alter table public.employees
  add column if not exists gift_type text not null default 'cake'
    check (gift_type in ('cake', 'flowers'));

alter table public.orders
  add column if not exists gift_type text not null default 'cake'
    check (gift_type in ('cake', 'flowers'));

-- Allow two deliveries per calendar year (twice_yearly).
drop index if exists public.orders_employee_year_unique;

create unique index if not exists orders_employee_delivery_unique
  on public.orders (employee_id, delivery_date);

-- Florist order emails use a separate reminder type.
alter table public.reminder_log
  drop constraint if exists reminder_log_type_check;

alter table public.reminder_log
  add constraint reminder_log_type_check
  check (type in (
    '14_days',
    '7_days_bakery',
    '7_days_florist',
    '7_days_company',
    '1_day',
    'day_of'
  ));
