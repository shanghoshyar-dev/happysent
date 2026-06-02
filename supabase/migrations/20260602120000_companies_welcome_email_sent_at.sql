alter table public.companies
  add column if not exists welcome_email_sent_at timestamptz;

comment on column public.companies.welcome_email_sent_at is
  'När välkomstmejl skickats till contact_email (efter att anställda lagts in).';
