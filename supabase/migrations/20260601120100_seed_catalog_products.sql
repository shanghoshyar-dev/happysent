-- De 9 tårtorna från Happysent-tårtkatalogen (Konditori Katarina / Malmö-bageri).

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
cross join lateral (
  select id from public.bakeries
  where name ilike '%katarina%'
  order by created_at
  limit 1
) b
on conflict (name) do update set
  bakery_id = excluded.bakery_id,
  dietary_notes = excluded.dietary_notes,
  sort_order = excluded.sort_order,
  is_active = true;

-- Om inget bageri matchar "Katarina", koppla till första Malmö-bageriet.
update public.products p
set bakery_id = b.id
from (
  select id from public.bakeries
  where city ilike '%malmö%'
  order by created_at
  limit 1
) b
where p.bakery_id is null
  and p.name in (
    'HappySent Tårta',
    'Budapestårta',
    'Jordgubbstårta',
    'Chokladtrippel',
    'Hallontårta',
    'Princesstårta',
    'Schwarzwaldtårta',
    'Lyxprincesstårta',
    'Jordgubb & rabarbertårta'
  );
