-- Hjälporganisationer för kundröstning + vinnare i års-snapshot.

create table if not exists public.donation_charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.donation_charities (name, slug, sort_order) values
  ('Läkare Utan Gränser', 'lakare-utan-granser', 1),
  ('UNICEF Sverige', 'unicef-sverige', 2),
  ('Sverige för UNHCR', 'sverige-for-unhcr', 3),
  ('Rädda Barnen', 'radda-barnen', 4),
  ('Svenska Röda Korset', 'svenska-roda-korset', 5)
on conflict (slug) do nothing;

alter table public.companies
  add column if not exists donation_charity_id uuid references public.donation_charities (id) on delete set null,
  add column if not exists donation_charity_voted_at timestamptz;

comment on column public.companies.donation_charity_id is
  'Kundens röst i donationskampanjen (vilken org som ska få hela årets kassa).';
comment on column public.companies.donation_charity_voted_at is
  'Senaste rösttid — används vid tiebreak (org som nådde röstantalet först).';

alter table public.donation_campaign_snapshots
  add column if not exists winning_charity_id uuid references public.donation_charities (id) on delete set null,
  add column if not exists votes_by_charity jsonb;

comment on column public.donation_campaign_snapshots.winning_charity_id is
  'Organisation med flest kundröster som får hela total_kr.';
comment on column public.donation_campaign_snapshots.votes_by_charity is
  'Röstfördelning vid årsavslut: { "charity_uuid": vote_count }.';

alter table public.donation_charities enable row level security;

drop policy if exists donation_charities_public_select on public.donation_charities;
create policy donation_charities_public_select
  on public.donation_charities
  for select
  to authenticated, anon
  using (is_active = true);

drop policy if exists donation_charities_admin_all on public.donation_charities;
create policy donation_charities_admin_all
  on public.donation_charities
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on table public.donation_charities to anon, authenticated;
grant insert, update, delete on table public.donation_charities to authenticated;
