# Tidklocka – Arbetstidsregistrering

En modern, lösenordsskyddad webbapplikation för personlig arbetstidsregistrering. Byggd med Next.js, TypeScript, Tailwind CSS och Supabase.

## Funktioner

- **Timer** – Starta/stoppa klockan med ett klick. Timern fortsätter om sidan laddas om eller webbläsaren stängs.
- **Manuell registrering** – Lägg till arbetstid i efterhand.
- **Dashboard** – Översikt med dagens tid, månadsstatistik, mål och senaste registreringar.
- **Historik** – Filtrera, sök, redigera och radera registreringar.
- **Månadsrapport** – Veckodiagram, kategorifördelning, vanligaste uppgifter. Export till CSV och PDF (utskrift).
- **Arbetstidsmål** – Ange månatligt mål och se framsteg.
- **Kategorier** – Skapa och hantera egna kategorier med färger.
- **Mörkt läge** – Automatiskt baserat på systeminställning eller manuell växling.
- **Responsiv** – Fungerar på dator, surfplatta och mobil.

## Teknik

| Teknologi | Användning |
|-----------|------------|
| [Next.js 14](https://nextjs.org) | App Router, SSR/CSR |
| [TypeScript](https://typescriptlang.org) | Typsäkerhet |
| [Tailwind CSS](https://tailwindcss.com) | Stilsättning |
| [Supabase](https://supabase.com) | Databas + Auth |
| [Recharts](https://recharts.org) | Diagram |
| [date-fns](https://date-fns.org) | Datumhantering |

## Installation

### 1. Förutsättningar

- Node.js 18+
- npm, yarn eller pnpm
- Ett Supabase-projekt (gratis på [supabase.com](https://supabase.com))

### 2. Klona och installera

```bash
cd timer-c
npm install
```

### 3. Miljövariabler

```bash
cp .env.example .env.local
```

Fyll i din Supabase-URL och anon-nyckel i `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://din-projekt-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-nyckel
```

Du hittar dessa under **Settings → API** i Supabase-dashboarden.

### 4. Sätt upp databasen

Gå till **SQL Editor** i Supabase och kör hela filen `supabase/schema.sql`.

Den skapar:
- Tabeller: `profiles`, `categories`, `time_entries`, `active_timers`, `user_settings`
- Triggers (auto-uppdatera `updated_at`, skapa profil + standardkategorier vid ny användare)
- Index för snabba queries
- Row Level Security (RLS) – varje användare ser bara sin egen data

### 5. Skapa en användare

Eftersom publik registrering är inaktiverad skapar du konton manuellt:

1. Gå till **Authentication → Users** i Supabase-dashboarden
2. Klicka **Add user**
3. Ange e-post och lösenord
4. Klicka **Create user**

Användaren kan nu logga in på applikationen.

### 6. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i webbläsaren.

## Driftsättning på Vercel

1. Pusha koden till ett GitHub-repo
2. Importera projektet i [Vercel](https://vercel.com)
3. Lägg till miljövariablerna under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klicka **Deploy**

## Projektstruktur

```
src/
├── app/                    # Next.js App Router-sidor
│   ├── dashboard/          # Startsida (dashboard)
│   ├── timer/              # Tidtagning + manuell registrering
│   ├── history/            # Historik med filter
│   ├── report/             # Månadsrapport med diagram
│   ├── settings/           # Mål och kategorier
│   └── login/              # Inloggningssida
├── components/
│   ├── ui/                 # Baskomponenter (Button, Card, Modal, osv.)
│   ├── layout/             # Navigation och AppShell
│   ├── timer/              # Timerkomponenter
│   ├── history/            # Historikkomponenter
│   └── report/             # Rapportdiagram
├── contexts/               # AuthContext, ToastContext
├── hooks/                  # useTimer, useTimeEntries, useCategories, useUserSettings
├── lib/
│   ├── supabase/           # Supabase-klienter (client.ts, server.ts)
│   └── utils.ts            # Hjälpfunktioner
└── types/                  # TypeScript-typer
supabase/
└── schema.sql              # Komplett databasschema med RLS
```

## Säkerhet

- **Row Level Security (RLS)**: Alla databaspolicies säkerställer att en användare bara kan läsa och skriva sin egen data.
- **Middleware-skydd**: Alla rutter utom `/login` kräver aktiv session.
- **Ingen publik registrering**: Konton skapas bara av administratören i Supabase-dashboarden.

## Licens

MIT
# time
