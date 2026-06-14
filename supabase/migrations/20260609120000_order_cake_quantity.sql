-- How many cakes of the given size are included in one birthday order.

alter table public.orders
  add column if not exists cake_quantity int not null default 1
  check (cake_quantity >= 1);

comment on column public.orders.cake_quantity is
  'Number of cakes ordered (same type/size). Total price is stored in price.';
