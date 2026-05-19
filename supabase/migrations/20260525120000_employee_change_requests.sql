-- Kö för lägg till / ta bort anställd via kontaktformuläret (befintliga kunder).

create table public.employee_change_requests (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  action_type text not null check (action_type in ('add', 'remove')),
  company_name text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  submitted_by_email text not null,
  message text,
  number_of_people int check (number_of_people is null or number_of_people >= 1),
  employees jsonb not null default '[]'::jsonb,
  matched_company_id uuid references public.companies(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index employee_change_requests_pending_created_idx
  on public.employee_change_requests (created_at desc)
  where status = 'pending';

alter table public.employee_change_requests enable row level security;

create policy employee_change_requests_admin_all
  on public.employee_change_requests
  for all
  to authenticated
  using (true)
  with check (true);

grant all on table public.employee_change_requests to postgres;
grant all on table public.employee_change_requests to service_role;
grant select, insert, update, delete on table public.employee_change_requests to authenticated;

comment on table public.employee_change_requests is
  'Väntande förfrågningar om att lägga till eller ta bort anställda från /kontakt (redan kund).';
