-- Telefon till kontaktperson på företaget (syns t.ex. i beställningsmejl till bageri).

alter table public.companies
  add column if not exists contact_phone text;

comment on column public.companies.contact_phone is
  'Telefon till kontaktperson för leverans/avvikelser; skickas till bageri vid 7-dagarsbeställning.';
