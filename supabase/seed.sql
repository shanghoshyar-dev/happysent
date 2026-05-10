-- Seed data for local development

insert into public.products (name, is_active) values
  ('Tårta', true),
  ('Cupcakes', true),
  ('Blommor', true)
on conflict (name) do nothing;

-- One Malmö bakery
insert into public.bakeries (id, name, email, phone, city, opening_hours, days_notice, notes)
values (
  '00000000-0000-0000-0000-000000000001',
  'Söderbergs Konditori',
  'order@soderbergs.example',
  '+46 40 123 45 67',
  'Malmö',
  'Mån–Fre 07:00–18:00',
  7,
  'Föredrar beställningar via mejl, leverans inom Malmö 08–11.'
)
on conflict (id) do nothing;

-- One sample company
insert into public.companies (id, name, address, city, contact_email, billing_email, bakery_id, price_per_cake, status)
values (
  '00000000-0000-0000-0000-000000000010',
  'Acme AB',
  'Storgatan 1, 211 34 Malmö',
  'Malmö',
  'hr@acme.example',
  'faktura@acme.example',
  '00000000-0000-0000-0000-000000000001',
  450,
  'active'
)
on conflict (id) do nothing;

-- A couple of sample employees
insert into public.employees (company_id, first_name, last_name, birthday, number_of_people)
values
  ('00000000-0000-0000-0000-000000000010', 'Kalle', 'Andersson', '1990-06-15', 8),
  ('00000000-0000-0000-0000-000000000010', 'Lisa',  'Berg',      '1985-11-02', 12)
on conflict do nothing;

-- A sample blog post
insert into public.blog_posts (title, content, author, is_published, published_at)
values (
  'Därför är födelsedagar viktiga på jobbet',
  'Att fira anställda är ett av de billigaste sätten att stärka företagskulturen...',
  'Happysent',
  true,
  now()
)
on conflict do nothing;
