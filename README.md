# Happysent

Automatiserad födelsedagstårta-leverans för företag. Happysent är mellanhanden mellan företag och lokala bagerier — företag registrerar sina anställda, och systemet sköter resten: påminnelser, beställningar och fakturering.

## Teknisk stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** för styling
- **Supabase** för Postgres-databas och auth
- **Resend** för transaktionella e-postmeddelanden
- **Vercel** för hosting och cron jobs

## Komma igång

### 1. Klona och installera

```bash
npm install
```

### 2. Sätt upp Supabase

1. Skapa ett nytt projekt på [supabase.com](https://supabase.com).
2. Installera Supabase CLI: `npm install -g supabase` (eller använd den lokala devDependency).
3. Logga in: `npx supabase login`.
4. Länka ditt projekt: `npx supabase link --project-ref <din-project-ref>`.
5. Pusha schemat: `npm run db:push`.
6. (Valfritt) Kör seed-filen: `npx supabase db reset` för att också ladda `supabase/seed.sql`.
7. Generera TypeScript-typer: `npm run db:types`.

### 3. Konfigurera Resend

1. Skapa konto på [resend.com](https://resend.com) och verifiera din avsändardomän.
2. Skapa en API-nyckel och lägg till den i `.env.local`.

### 4. Miljövariabler

Kopiera `.env.local.example` till `.env.local` och fyll i värdena:

```bash
cp .env.local.example .env.local
```

| Variabel | Beskrivning |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL till ditt Supabase-projekt |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publik anon-nyckel |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role-nyckel (server-only, hemlig) |
| `RESEND_API_KEY` | API-nyckel från Resend |
| `ADMIN_EMAIL` | Mailadress som tar emot interna notiser och fungerar som "from"-avsändare |
| `CRON_SECRET` | Slumpmässig sträng som skyddar `/api/cron/*` |

### 5. Skapa admin-användare

1. I Supabase Dashboard → **Authentication → Users → Add user**, lägg till din mailadress (samma som `ADMIN_EMAIL`).
2. Efter migration `20260603120000_customer_portal.sql`: kör SQL i [`supabase/scripts/seed-admin-user.sql`](supabase/scripts/seed-admin-user.sql) så användaren läggs i `admin_users` (krävs för `/admin` efter RLS-härdning).
3. Logga in på `/login` (lösenord eller magisk länk).

**Supabase Auth → URL configuration:** lägg till redirect URLs `https://happysent.com/auth/callback` (och `http://localhost:3000/auth/callback` i dev).

### Kundportal (HR)

- Inloggning: `/kund/login`
- Admin skickar inbjudan från **Aktivera företag** efter att anställda lagts in.
- HR hanterar anställda på `/kund` — ser bara sitt eget företag (RLS).
- Favorittårtor väljs på `/kund/tartor` (kräver migration `20260604120000_employee_preferred_product.sql`).

### 6. Starta dev-servern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Deploy till Vercel

1. Push till GitHub och importera repot i Vercel.
2. Lägg till alla miljövariabler från `.env.local` i Vercel-projektet.
3. Cronjobbet i `vercel.json` kör automatiskt `/api/cron/daily-check` varje dag kl 07:00 UTC (= 08:00 svensk tid på vintern, 09:00 på sommaren — koden hanterar tidszonen korrekt).

## Daglig logik

Cronjobbet kontrollerar varje aktiv anställd och triggar mejl vid:

- **14 dagar** kvar → mejl till företaget ("tårtan är bokad").
- **7 dagar** kvar → beställning till bageriet + bekräftelse till företaget.
- **1 dag** kvar → påminnelse till företaget.
- **På dagen** → leveransbekräftelse till företaget + status `delivered`.

Tabellen `reminder_log` säkerställer idempotens — samma mejl skickas aldrig två gånger för samma anställd och födelseår.

Leveransdatum justeras automatiskt bakåt om födelsedagen infaller på lördag, söndag eller svensk röd dag (se `src/lib/holidays/swedish.ts`).

## Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Publika sidor
│   ├── admin/              # Skyddat dashboard
│   ├── api/cron/           # Cronjobbsendpoint
│   ├── login/              # Magic link login
│   └── auth/callback/      # Supabase auth callback
├── components/             # UI-komponenter
├── lib/
│   ├── supabase/           # Klienter (browser, server, service-role)
│   ├── resend/             # E-postklient + svenska mallar
│   ├── holidays/           # Svenska röda dagar
│   ├── cron/               # Affärslogik för dagliga kontroller
│   └── env.ts              # Validering av miljövariabler
└── types/database.ts       # Genererade Supabase-typer
```

## Skript

```bash
npm run dev          # Starta dev-servern
npm run build        # Produktionsbygge
npm run start        # Starta produktionsserver
npm run lint         # Kör ESLint
npm run db:push      # Pusha migrationer till Supabase
npm run db:types     # Regenerera TypeScript-typer
npm run db:reset     # Återställ lokal DB + kör seed
```

## Att göra (utanför detta första scope)

- Stripe-integration för automatisk betalningsmatchning (PDF-faktura + nedladdning/mejl finns i admin → Fakturor).
- Företagsinloggning (just nu bara admin).
- Tester.
