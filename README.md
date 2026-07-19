# Sentinel Compliance Platform

**Compliance, proven.** A zero-install, tap-to-log compliance platform. Staff tap
an NFC tag (or scan a QR) at a physical station; a phone browser opens a page that
records a timestamped, unchangeable log. Owners view a live dashboard that answers
"am I compliant right now?" Sentinel staff onboard clients from an admin console.

Built to the spec in `SENTINEL_MASTER_BUILD_PROMPT.md`, which inherits from
`SOUL.md` (the source of truth). No native app, ever.

## Stack

- Next.js (App Router, React, TypeScript) + Tailwind CSS v4
- Backend: Google Sheets API v4 (service-account, server-side only)
- Auth: signed-cookie sessions (swappable for Auth.js/NextAuth)
- Hosting: Vercel

## The data-access boundary

**All** database reads/writes go through one module: `src/lib/db/index.ts`. No
component or route calls the Google API directly. This makes a future
Supabase/Postgres migration a single-file swap (SOUL §13.8). Treat any direct
Sheets call outside `src/lib/db/*` as a defect.

If Google credentials are absent, the app automatically uses an in-memory demo
store seeded with one warehouse client — so `npm run dev` works with zero secrets.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional; demo mode works without it
npm run dev
```

Then:

- **Tap Page (public):** http://localhost:3000/t/DMO-001
- **Sign in:** http://localhost:3000/login
  - Manager: `manager@demo` / `demo` → Dashboard
  - Sentinel admin: `admin@sentinel` / `sentinel` → Admin console

## Milestones (build order)

1. **Tap Page + append** — `GET /t/[tagId]`, `POST /api/log` (append-only, server timestamp)
2. **Admin** — `/admin`: onboard clients, assign template pack, register tags, reassign meaning, export placement list
3. **Dashboard** — `/dashboard`: live compliance %, counts, per-tag status, confidence-first
4. **PDF report** — `GET /api/report?client=&from=&to=` (read-only, reconciles with data)
5. **Alerts feed** — overdue tags surface in-dashboard; auto-clear on next valid log

## Template packs

Log types are configuration, not hardcode (`src/lib/packs.ts`): `warehouse`,
`healthcare`, `generic`. A new industry = a new pack, zero app changes.

## Google Sheets setup (production)

1. Google Cloud: create a project, enable the Sheets API, create a **service
   account**, download its JSON key.
2. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`.
3. Create a **Master Index** sheet with columns `Client | Spreadsheet ID | Pack |
   Status`. Share it (and every client workbook) with the service-account email
   as Editor. Set `MASTER_INDEX_SHEET_ID`.
4. Each client gets a workbook with tabs `Tag Registry` and `Log Entries`
   (auto-created with headers on first write).

## Hard guardrails (enforced in code)

- Log Entries are **append-only** — no update/delete path anywhere.
- Timestamps are **server-set**; client time is never trusted.
- Service-account credentials are **server-side only**.
- No native app; no login at the point of use.
- Charcoal is product-UI chrome only — never a full-section marketing background.
