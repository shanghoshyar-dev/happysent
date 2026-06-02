# HappySent roadmap

## Klart / pågår

- [x] Tårtkatalog PDF (`public/marketing/tartkatalog.pdf`)
- [x] 9 tårtor i databas (migration `20260601120100_seed_catalog_products.sql`)
- [x] Tårtval via länk i 14-dagarsmejl (`/valja-tarta/[token]`) — HR ser tårtor för **företagets stad**, inget bagerinamn
- [x] Auto-val 9 dagar före leverans om kunden inte svarat
- [x] Bageri-mejl inkluderar tårtnamn

## Nästa steg: kundportal (F)

> **Påminnelse:** Full kundportal så HR själva hanterar anställda och tårtval utan att ringa er.

Planerat:

1. **`company_users`** — inloggning kopplad till ett företag
2. **`/kund`-område** — dashboard: anställda, kommande födelsedagar, tårtval, pausa leverans
3. **RLS** — kund ser bara sitt `company_id`, admin ser allt som idag
4. **Inbjudan** — mejl med aktiveringslänk när företaget skapas (gäller alla vägar in, se nedan)

Er **adminportal (`/admin`)** behålls oförändrad som backoffice: priser, bagerier, fakturor, alla företag.

### Nya kunder — samma flöde oavsett kanal

| Hur kunden kommer in | Idag | När F är klart |
|----------------------|------|----------------|
| Kontaktformulär → kö → godkänn | Ni skapar i admin | + **inbjudningsmejl** till kontaktmejl |
| **Telefon / möte / mail till er** | Ni skapar i admin direkt | + **samma inbjudningsmejl** |
| Excel med anställda | Ni importerar i admin | HR kan göra det själv i portalen |

Ingen separat “telefon-version” — bara **Admin → Nytt företag** med rätt `contact_email`, sedan automatisk inbjudan när portalen finns.

Tills dess: ni lägger in anställda i admin; tårtval sker via länk i 14-dagarsmejlet (`/valja-tarta/[token]`).

## Supabase-migrationer att köra i prod

Kör i SQL Editor (eller `npm run db:push` efter `supabase link`):

1. `20260601120000_cake_selection.sql`
2. `20260601120100_seed_catalog_products.sql`

(Tidigare om ej kört: `20260528120000_invoices_sent_at.sql`, `20260531120000_invoices_grants.sql`)
