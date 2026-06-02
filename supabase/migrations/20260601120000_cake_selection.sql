-- Tårtval: sortiment, token-länk, deadline, auto-val.

alter table public.products
  add column if not exists bakery_id uuid references public.bakeries(id) on delete set null,
  add column if not exists description text,
  add column if not exists dietary_notes text,
  add column if not exists min_people int check (min_people is null or min_people > 0),
  add column if not exists max_people int check (max_people is null or max_people > 0),
  add column if not exists sort_order int not null default 0;

create index if not exists products_bakery_idx on public.products (bakery_id);

alter table public.companies
  add column if not exists default_product_id uuid references public.products(id) on delete set null;

alter table public.orders
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists selection_token uuid,
  add column if not exists selection_deadline date,
  add column if not exists cake_selection_status text not null default 'pending',
  add column if not exists selected_at timestamptz;

update public.orders
set selection_token = gen_random_uuid()
where selection_token is null;

alter table public.orders
  alter column selection_token set default gen_random_uuid();

alter table public.orders
  alter column selection_token set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_cake_selection_status_check'
  ) then
    alter table public.orders
      add constraint orders_cake_selection_status_check
      check (cake_selection_status in ('pending', 'customer', 'auto', 'default'));
  end if;
end $$;

create unique index if not exists orders_selection_token_unique
  on public.orders (selection_token);

comment on column public.orders.selection_token is
  'Token för /valja-tarta/[token] utan inloggning.';
comment on column public.orders.selection_deadline is
  'Sista dag för kund att välja (5 dagar efter 14-dagarsmejl).';
comment on column public.orders.cake_selection_status is
  'pending | customer | auto | default';
