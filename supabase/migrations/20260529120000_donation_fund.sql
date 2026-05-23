-- Donationskassa: 10 kr per levererad tårta/blomma när faktura markeras betald.
create table if not exists public.donation_contributions (
  invoice_id uuid primary key references public.invoices(id) on delete cascade,
  order_count int not null check (order_count > 0),
  amount_kr int not null check (amount_kr > 0),
  created_at timestamptz not null default now()
);

create index if not exists donation_contributions_created_idx
  on public.donation_contributions (created_at desc);

alter table public.donation_contributions enable row level security;

drop policy if exists donation_contributions_admin_all on public.donation_contributions;

create policy donation_contributions_admin_all
  on public.donation_contributions
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on table public.donation_contributions to authenticated;

comment on table public.donation_contributions is
  'Insättning i donationskassan vid betald faktura (10 kr × antal ordrar).';
