-- Avslutad donationskampanj per kalenderår (summa + mejl vid årsskifte).
create table if not exists public.donation_campaign_snapshots (
  year int primary key,
  total_kr int not null check (total_kr >= 0),
  closed_at timestamptz not null default now(),
  email_sent_at timestamptz
);

alter table public.donation_campaign_snapshots enable row level security;

drop policy if exists donation_campaign_snapshots_admin_all on public.donation_campaign_snapshots;

create policy donation_campaign_snapshots_admin_all
  on public.donation_campaign_snapshots
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on table public.donation_campaign_snapshots to authenticated;

comment on table public.donation_campaign_snapshots is
  'Slutsumma per insamlingsår när kampanjen stängs efter 31 december.';
