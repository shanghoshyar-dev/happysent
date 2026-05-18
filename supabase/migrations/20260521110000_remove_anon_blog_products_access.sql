-- Stäng av all anonym (anon) läsning via PostgREST för blogg och produkter.
-- Publik webb hämtar dessa via serverkod med service_role (se Next-appen).
-- Kunddata (företag, anställda, ordrar m.m.) har aldrig haft anon-policies.

drop policy if exists blog_posts_public_read on public.blog_posts;
drop policy if exists products_public_read on public.products;

revoke select on table public.blog_posts from anon;
revoke select on table public.products from anon;

comment on table public.blog_posts is
  'Blogg. Ingen anon-läsning: publicerade inlägg läses via service_role på servern; authenticated har admin-policy.';

comment on table public.products is
  'Produktkategorier. Ingen anon-läsning; admin via authenticated; vid behov server/service_role.';
