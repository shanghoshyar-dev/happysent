-- Säkerställ att inloggad admin kan läsa/skriva fakturor (saknades i initial schema).
grant select, insert, update, delete on table public.invoices to authenticated;
grant all on table public.invoices to service_role;
