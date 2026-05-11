-- Blog SEO + slug URLs
alter table public.blog_posts
  add column if not exists slug text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists og_image_url text,
  add column if not exists excerpt text;

-- Backfill slugs for existing rows (stable unique)
update public.blog_posts
set slug = 'inlagg-' || left(replace(id::text, '-', ''), 12)
where slug is null or trim(slug) = '';

alter table public.blog_posts alter column slug set not null;
create unique index if not exists blog_posts_slug_key on public.blog_posts (slug);

-- Singleton operational settings (editable from admin)
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  admin_email_override text,
  default_price_per_cake int not null default 450 check (default_price_per_cake >= 0),
  delivery_window_start text not null default '08:00',
  delivery_window_end text not null default '11:00',
  cancellation_days_before_delivery int not null default 10
    check (cancellation_days_before_delivery >= 0),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (1)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists app_settings_admin_all on public.app_settings;

create policy app_settings_admin_all
  on public.app_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- Contact form rate limiting (service-role writes only)
create table if not exists public.contact_rate_limits (
  bucket_key text primary key,
  window_start timestamptz not null,
  hit_count int not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.contact_rate_limits enable row level security;
