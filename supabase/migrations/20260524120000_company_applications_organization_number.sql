-- Organisationsnummer från nykundsformuläret (kontakt).

alter table public.company_applications
  add column if not exists organization_number text;

comment on column public.company_applications.organization_number is
  'Svenskt organisationsnummer (10 siffror), normaliserat utan bindestreck.';
