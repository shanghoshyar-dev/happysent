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

-- Sample florist (Malmö)
insert into public.florists (id, name, email, phone, city, opening_hours, days_notice, notes)
values (
  '00000000-0000-0000-0000-000000000002',
  'Blomsterateljén Exempel',
  'order@blomsterateljen.example',
  '+46 40 987 65 43',
  'Malmö',
  'Mån–Lör 09:00–18:00',
  5,
  'Beställ blombuketter via mejl minst 5 vardagar i förväg.'
)
on conflict (id) do nothing;

-- One sample company
insert into public.companies (id, name, address, city, contact_email, billing_email, bakery_id, status)
values (
  '00000000-0000-0000-0000-000000000010',
  'Acme AB',
  'Storgatan 1, 211 34 Malmö',
  'Malmö',
  'hr@acme.example',
  'faktura@acme.example',
  '00000000-0000-0000-0000-000000000001',
  'active'
)
on conflict (id) do nothing;

-- A couple of sample employees
insert into public.employees (company_id, first_name, last_name, birthday, number_of_people)
values
  ('00000000-0000-0000-0000-000000000010', 'Kalle', 'Andersson', '1990-06-15', 8),
  ('00000000-0000-0000-0000-000000000010', 'Lisa',  'Berg',      '1985-11-02', 12)
on conflict do nothing;

-- Blog demo posts (Swedish SEO slugs)
delete from public.blog_posts;

insert into public.blog_posts (
  title, slug, content, author, is_published, published_at,
  meta_title, meta_description, excerpt, og_image_url
) values
(
  'Därför presterar glada anställda bättre',
  'darfor-presterar-glada-anstallda-battre',
  $b1$
## Humör är inte fluff – det är resultat

När människor mår bra på jobbet syns det oftast i mötena: vi lyssnar mer, tar ansvar snabbare och vågar säga till när något krånglar. **Anställdas välmående** handlar inte bara om mjuka värden utan om hur ofta teamet orkar göra det där lilla extra som skillnad för kunder och kollegor – något många Malmöbolag jagar i en tajt arbetsmarknad.

### Vad säger forskning och vardagen?

Studier om positiva arbetsmiljöer pekar gång på gång på samma sak: trygghet, erkännande och meningsfull återkoppling höjer både kreativitet och uthållighet. På kontoret märks det som färre missförstånd i projekt, högre kvalitet i leveranser och att folk stannar kvar längre. Små insatser som **personalförmåner** och återkommande firanden bidrar till en **företagskultur** där folk vill göra sitt bästa – inte bara klara dagen.

### Varför återkommande firanden funkar

En **födelsedag på jobbet** är ett enkelt sätt att visa att organisationen ser människan bakom rollen. Det behöver inte vara storslaget – det ska vara varmt och förutsägbart. När chefen eller HR inte behöver jaga kalendrar slipper ni dessutom stressen med det som glömts bort, och kan lägga energin på att **motivera anställda** i det som verkligen driver affären.

## Vill ni göra det lättare för er själva?

Happysent hjälper er att automatisera firandet med lokala leveranser i Malmö. [Se priser](/priser), [kontakta oss för demo](/kontakt), och läs mer om varför firande på jobbet lönar sig i [Därför är födelsedagar viktiga på jobbet](/blogg/darfor-ar-fodelsedagar-viktiga-pa-jobbet). Mer konkret uppskattning hittar du i [5 sätt att få dina anställda att känna sig sedda](/blogg/5-satt-att-fa-dina-anstallda-att-kanna-sig-sedda) och [varför små gester gör skillnad](/blogg/varfor-smaga-gester-gor-stor-skillnad-pa-jobbet).
$b1$,
  'Happysent',
  true,
  now() - interval '5 days',
  'Därför presterar glada anställda bättre | Happysent Malmö',
  'Gladare team levererar oftare på topp. Läs hur anställdas välmående, firande och företagskultur hänger ihop – och hur ni kan motivera anställda utan krångel.',
  'Gladare team levererar oftare på topp. Så hänger välmående ihop med prestation och varför en planerad födelsedag på jobbet är en smart personalförmån.',
  null
),
(
  '5 sätt att få dina anställda att känna sig sedda',
  '5-satt-att-fa-dina-anstallda-att-kanna-sig-sedda',
  $b2$
## Synlighet handlar om konsekvens – inte bara om slogans

Att känna sig sedd är en av de starkaste drivkrafterna för **anställdas välmående**. Det handlar mindre om enstaka pingisbord och mer om att återkommande visa att ni ser prestationer, behov och livssituationer – oavsett om teamet sitter centralt i Malmö eller på distans.

### Fem vanor som lyfter er HR-vardag

1. **Berätta vad som förväntas – och varför det spelar roll.** Tydliga mål gör det lättare att fira små framsteg.
2. **Ge mikrofeedback i vardagen.** En mening efter mötet räcker för att stärka tryggheten.
3. **Skapa naturliga tillfällen för lagkänsla**, till exempel en gemensam **födelsedag på jobbet** med något lokalt och gott.
4. **Var transparent med hur ni investerar i välmående** – **personalförmåner** ska vara lätta att förstå.
5. **Be om input och visa att ni agerar.** Det bygger den **företagskultur** som gör att folk vill stanna.

### Koppla gesten till syfte

När ni firar någon, koppla det till värdet personen skapar för teamet. Det gör erkännandet äkta och hjälper er **motivera anställda** utan att tävla i dyra engångsprofiler.

## Vill ni automatisera firandet?

Happysent levererar färska tårtor från lokala bagerier till kontoret – utan kalenderstress. [Kontakta oss](/kontakt), jämför [priser](/priser), och läs om varför **födelsedag på jobbet** betyder så mycket i [Därför är födelsedagar viktiga på jobbet](/blogg/darfor-ar-fodelsedagar-viktiga-pa-jobbet). Se också [Därför presterar glada anställda bättre](/blogg/darfor-presterar-glada-anstallda-battre) och [varför små gester gör skillnad](/blogg/varfor-smaga-gester-gor-stor-skillnad-pa-jobbet).
$b2$,
  'Happysent',
  true,
  now() - interval '3 days',
  '5 sätt att få anställda att känna sig sedda | Happysent',
  'Konkreta vanor för HR och chefer: öka anställdas välmående, stärk företagskultur och motivera anställda med små, äkta gester – även på kontoret i Malmö.',
  'Fem vanor som gör medarbetare synliga: feedback, tydlighet och firanden som bygger lagkänsla – perfekt för HR som vill vässa personalförmånerna.',
  null
),
(
  'Varför små gester gör stor skillnad på jobbet',
  'varfor-smaga-gester-gor-stor-skillnad-pa-jobbet',
  $b3$
## Det är det förutsägbara som bygger tillit

De mest ihågkomna arbetsplatserna är sällan de som skriker mest om kultur – utan de som gång på gång visar att de bryr sig. En **födelsedag på jobbet**, en tack-lunch efter en tung sprint eller ett enkelt ”bra jobbat” i korridoren är **personalförmåner** i mikroformat: billigare än stora program, men enorma för **anställdas välmående** när de kommer regelbundet.

### Varför chefer underskattar repetition

Vi tror ofta att överraskningar är starkast. I praktiken är det återkommande rit som skapar psykologisk trygghet – särskilt i tillväxtbolag i Malmö där tempot är högt. När organisationen visar att firande är planerat slipper medarbetare känna att de måste påminna om egna milstolpar.

### Koppling till era mål

Små gester signalerar **företagskultur** i handling: vi ser människor, inte bara roller. Det gör det lättare att **motivera anställda** att samarbeta över avdelningsgränser och att våga säga ifrån innan problem växer.

## Gör gesterna skalbara

Happysent automatiserar återkommande firanden med lokala leveranser så att HR och ledning kan fokusera på strategi – inte på kalenderpåminnelser. [Se priser](/priser), [boka samtal](/kontakt), och läs varför firandet av **födelsedagar** spelar roll i [Därför är födelsedagar viktiga på jobbet](/blogg/darfor-ar-fodelsedagar-viktiga-pa-jobbet). Mer om lag som presterar: [Därför presterar glada anställda bättre](/blogg/darfor-presterar-glada-anstallda-battre) och [5 sätt att få dina anställda att känna sig sedda](/blogg/5-satt-att-fa-dina-anstallda-att-kanna-sig-sedda).
$b3$,
  'Happysent',
  true,
  now() - interval '1 day',
  'Små gester, stor effekt på jobbet | Happysent Malmö',
  'Små, regelbundna gester stärker anställdas välmående och företagskultur. Läs varför förutsägbara firanden slår enstaka överraskningar – och hur Happysent hjälper till.',
  'Mikro-gester som återkommer bygger tillit och gör det lättare att motivera anställda – särskilt när ni firar födelsedag på jobbet på ett enkelt sätt.',
  null
),
(
  'Därför är födelsedagar viktiga på jobbet',
  'darfor-ar-fodelsedagar-viktiga-pa-jobbet',
  $b4$
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
$b4$,
  'Happysent',
  true,
  now(),
  'Därför är födelsedagar viktiga på jobbet – Happysent',
  'Att fira anställdas födelsedagar är ett av de billigaste och mest effektiva sätten att stärka företagskulturen. Läs varför det spelar roll.',
  'Det handlar inte om tårtan – det handlar om att medarbetaren känner sig sedd. Läs hur födelsedag på jobbet stärker företagskultur och anställdas välmående.',
  null
);
