-- Spåra när faktura-PDF skickats till kund respektive laddats ner i admin.
alter table public.invoices
  add column if not exists sent_at timestamptz,
  add column if not exists pdf_downloaded_at timestamptz;

comment on column public.invoices.sent_at is
  'Tidsstämpel när faktura-PDF mejlades till kundens billing_email.';
comment on column public.invoices.pdf_downloaded_at is
  'Tidsstämpel för senaste PDF-nedladdning från admin.';
