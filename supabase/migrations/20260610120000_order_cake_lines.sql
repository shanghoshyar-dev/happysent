-- Snapshot of cake sizes in one order (same cake type, mixed sizes allowed).

alter table public.orders
  add column if not exists cake_lines jsonb;

comment on column public.orders.cake_lines is
  'JSON array of {people_count, quantity} for the order cake type.';
