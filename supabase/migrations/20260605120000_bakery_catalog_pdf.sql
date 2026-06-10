-- Bageri-specifik tårtkatalog (PDF) + publik lagringsbucket.

alter table public.bakeries
  add column if not exists catalog_pdf_path text;

comment on column public.bakeries.catalog_pdf_path is
  'Objektsökväg i bucket bakery_catalogs (t.ex. {uuid}/tartkatalog.pdf). Null = standardkatalog.';

insert into storage.buckets (id, name, public, file_size_limit)
values ('bakery_catalogs', 'bakery_catalogs', true, 10485760)
on conflict (id) do nothing;
