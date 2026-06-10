-- Katalogens 9 tårtor (tartkatalog.pdf) för varje bageri.
-- Tillåter samma tårtnamn på olika bagerier.

alter table public.products drop constraint if exists products_name_key;

create unique index if not exists products_bakery_name_unique
  on public.products (bakery_id, name);

insert into public.products (name, bakery_id, dietary_notes, sort_order, is_active)
select v.name, b.id, v.dietary_notes, v.sort_order, true
from (
  values
    ('HappySent Tårta', null::text, 1),
    ('Budapestårta', null::text, 2),
    ('Jordgubbstårta', 'Nötfri', 3),
    ('Chokladtrippel', 'Glutenfri', 4),
    ('Hallontårta', null::text, 5),
    ('Princesstårta', null::text, 6),
    ('Schwarzwaldtårta', null::text, 7),
    ('Lyxprincesstårta', null::text, 8),
    ('Jordgubb & rabarbertårta', 'Nötfri', 9)
) as v(name, dietary_notes, sort_order)
cross join public.bakeries b
on conflict (bakery_id, name) do update set
  dietary_notes = excluded.dietary_notes,
  sort_order = excluded.sort_order,
  is_active = true;
