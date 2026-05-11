-- Published article: Därför är födelsedagar viktiga på jobbet
insert into public.blog_posts (
  title, slug, content, author, is_published, published_at,
  meta_title, meta_description, excerpt, og_image_url
) values (
  'Därför är födelsedagar viktiga på jobbet',
  'darfor-ar-fodelsedagar-viktiga-pa-jobbet',
  $b$
Att fira anställdas födelsedagar kan verka som en liten gest, men forskning och praktik visar att det är en av de mest kraftfulla sakerna ett företag kan göra för sin **företagskultur**. Det handlar inte om tårtan. Det handlar om känslan av att bli sedd.

## Känslan av att vara sedd förändrar allt

En av de största anledningarna till att anställda lämnar sitt jobb är inte lönen – det är känslan av att inte bli uppskattad. Enligt Gallups forskning om medarbetarengagemang uppger nästan två tredjedelar av anställda att de inte fått erkännande för sitt arbete den senaste veckan. Det är en alarmerande siffra som kostar företag miljarder i personalomsättning varje år.

En födelsedag är ett unikt tillfälle. Det är en dag som tillhör den anställda helt och hållet – inte ett projekt, inte ett kvartalsmål – utan personen bakom arbetsrollen. När företaget uppmärksammar den dagen skickar det ett tydligt budskap: vi ser dig som en människa, inte bara som en resurs.

## Anställdas välmående påverkar produktiviteten direkt

Forskning från University of Warwick visar att glada anställda är upp till 12 procent mer produktiva än sina mindre nöjda kollegor. Det låter kanske som en liten siffra, men räkna ut vad 12 procents produktivitetsökning betyder för ett team på 20 personer under ett helt år.

**Anställdas välmående** byggs inte enbart av stora löneökningar eller flexibla arbetstider. Det byggs av hundratals små stunder där medarbetaren känner att de spelar roll. En **födelsedag på jobbet** uppmärksammad med en tårta och ett leende från kollegorna är en sådan stund. Det kostar lite men ger mycket.

## Företagskultur byggs av vanor, inte stora händelser

Många HR-ansvariga lägger stor energi på det stora: kickoffen, julbordet, teambuilding-dagen. Dessa är viktiga, men forskning om företagskultur visar att det är de återkommande, vardagliga ritualerna som formar kulturen på riktigt.

En födelsedag som firas varje år, utan undantag, för varje anställd oavsett position eller anciennitet bygger en kultur av jämlikhet och omsorg. Det blir en del av företagets DNA. Nya medarbetare lägger märke till det. Gamla medarbetare uppskattar det. Och när någon slutar och berättar om sin tid på företaget är det ofta de små gesterna de minns.

## Varför det ofta inte händer och hur man löser det

Problemet är enkelt. Ingen har tid att hålla koll. HR-avdelningar jonglerar med rekrytering, onboarding, löner och tusen andra saker. Att manuellt hålla koll på 50 anställdas födelsedagar och koordinera med ett konditori är i praktiken omöjligt utan ett system.

Det är precis det Happysent löser. Du registrerar dina anställda en gång och systemet sköter resten – automatiska påminnelser, beställning till lokalt konditori och leverans på rätt dag i Malmö. Dina anställda känner sig sedda och du behöver inte lyfta ett finger.

[Kontakta oss](/kontakt) och se hur Happysent passar er organisation. [Se våra priser](/priser). Vill du fördjupa dig finns mer att läsa om [glada team och resultat](/blogg/darfor-presterar-glada-anstallda-battre), [konkret uppskattning](/blogg/5-satt-att-fa-dina-anstallda-att-kanna-sig-sedda) och [små gester](/blogg/varfor-smaga-gester-gor-stor-skillnad-pa-jobbet).
$b$,
  'Happysent',
  true,
  now(),
  'Därför är födelsedagar viktiga på jobbet – Happysent',
  'Att fira anställdas födelsedagar är ett av de billigaste och mest effektiva sätten att stärka företagskulturen. Läs varför det spelar roll.',
  'Det handlar inte om tårtan – det handlar om att medarbetaren känner sig sedd. Läs hur födelsedag på jobbet stärker företagskultur och anställdas välmående.',
  null
)
on conflict (slug) do update set
  title = excluded.title,
  content = excluded.content,
  author = excluded.author,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  excerpt = excluded.excerpt,
  og_image_url = excluded.og_image_url;
