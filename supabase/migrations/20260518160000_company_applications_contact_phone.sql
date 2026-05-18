-- Telefon för nya kundförfrågningar (kontaktformuläret).

alter table public.company_applications
  add column if not exists contact_phone text;

comment on column public.company_applications.contact_phone is
  'Telefonnummer som anges vid intresseanmälan som ny kund.';
