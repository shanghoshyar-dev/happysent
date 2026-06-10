-- HR kan sätta favorittårta per anställd i kundportalen (innan order skapas).

alter table public.employees
  add column if not exists preferred_product_id uuid
  references public.products(id) on delete set null;

comment on column public.employees.preferred_product_id is
  'Vald favorittårta från kundportalen; används vid orderskapande och auto-val.';
