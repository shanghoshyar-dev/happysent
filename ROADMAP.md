# HappySent roadmap

## Klart

- [x] Tårtkatalog PDF (`public/marketing/tartkatalog.pdf`)
- [x] 9 tårtor i databas (migration `20260601120100_seed_catalog_products.sql`)
- [x] Tårtval via länk i 14-dagarsmejl (`/valja-tarta/[token]`) — HR ser tårtor för **företagets stad**, inget bagerinamn
- [x] **Tårtval i kundportalen** (`/kund/tartor`) — favorittårta per anställd (`employees.preferred_product_id`), PDF-katalog, auto-val vid order
- [x] Auto-val 9 dagar före leverans om kunden inte svarat
- [x] Bageri-mejl inkluderar tårtnamn
- [x] Aktivera företag efter ansökan (anställda + välkomstmejl manuellt)
- [x] **Kundportal (F) — MVP**
  - [x] `admin_users`, `company_users`, RLS per `company_id`
  - [x] `/kund` — översikt, anställda (CRUD, Excel, pausa), **tårtor**
  - [x] Inbjudan från Aktivera-sidan (`sendCompanyPortalInvite`)

Er **adminportal (`/admin`)** är backoffice: priser, bagerier, fakturor, alla företag.

### Nya kunder

| Kanal | Flöde |
|-------|--------|
| Kontaktformulär / telefon | Admin → godkänn → **Aktivera** → anställda → välkomstmejl → **inbjudan kundportal** |
| HR själva | Loggar in på `/kund` efter inbjudan |

Tårtval sker primärt i `/kund/tartor`; 14-dagarsmejlet med länk (`/valja-tarta/[token]`) finns kvar som backup.

## Supabase-migrationer att köra i prod

Kör i SQL Editor (eller `npm run db:push` efter `supabase link`):

1. `20260601120000_cake_selection.sql`
2. `20260601120100_seed_catalog_products.sql`
3. `20260602120000_companies_welcome_email_sent_at.sql`
4. **`20260603120000_customer_portal.sql`**
5. **`20260604120000_employee_preferred_product.sql`**

Sedan: [`supabase/scripts/seed-admin-user.sql`](supabase/scripts/seed-admin-user.sql) — lägg er admin i `admin_users`.

(Tidigare om ej kört: `20260528120000_invoices_sent_at.sql`, `20260531120000_invoices_grants.sql`)

## Prod-testchecklista (kundportal)

1. [ ] Migration + `admin_users` seed — admin kan öppna `/admin`
2. [ ] Godkänn ansökan → Aktivera → minst 1 anställd
3. [ ] Skicka välkomstmejl
4. [ ] Skicka inbjudan kundportal → HR accepterar invite → `/kund`
5. [ ] HR ser bara egna anställda; `/admin` nekas för HR
6. [ ] HR kan lägga till/redigera/pausa anställd
7. [ ] `/kund/tartor` — koppla favorittårta till anställd; syns i anställd-listan
