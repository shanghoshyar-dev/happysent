-- Excel med personal för nya kundansökningar + lagringsbucket.

alter table public.company_applications
  add column if not exists employees_import_storage_path text;

comment on column public.company_applications.employees_import_storage_path is
  'Objektsökväg i bucket company_application_uploads (t.ex. {uuid}/employees.xlsx).';

insert into storage.buckets (id, name, public, file_size_limit)
values ('company_application_uploads', 'company_application_uploads', false, 5242880)
on conflict (id) do nothing;
