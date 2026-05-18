-- Spårning av godkända användarvillkor vid första kontakt (nya kunder).

alter table public.company_applications
  add column if not exists terms_accepted_at timestamptz;

alter table public.company_applications
  add column if not exists terms_document_version text not null default 'May 2026';
