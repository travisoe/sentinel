# Sentinel Compliance Platform

**Compliance, proven.** A zero-install, tap-to-log compliance platform. Staff tap
an NFC tag (or scan a QR) at a physical station; a phone browser opens a page that
records a timestamped, unchangeable log. Owners view a live dashboard that answers
"am I compliant right now?" Sentinel staff onboard clients from an admin console.

Built to the spec in `SENTINEL_MASTER_BUILD_PROMPT.md`, which inherits from
`SOUL.md` (the source of truth). No native app, ever.

## Stack

- Next.js (App Router, React, TypeScript) + Tailwind CSS v4
- Backend: **Supabase (Postgres)** via the secret/service-role key, server-side only
- Auth: Supabase Auth with SSR cookie refresh and per-client profiles/RLS
- Billing: Stripe Checkout, subscriptions, webhooks, and Customer Portal
- Email: Resend weekly proof summaries
- Hosting: Vercel

## The data-access boundary

**All** application database reads/writes go through `src/lib/db/index.ts`.
Supabase implementation details remain inside `src/lib/db/*`.

Backend selection: **Supabase** if `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SECRET_KEY`
are set, otherwise an in-memory demo store.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional; demo mode works without it
npm run dev
```

Then:

- **Tap Page (public):** http://localhost:3000/t/DMO-001
- **Sign in:** http://localhost:3000/login
- **Pricing:** http://localhost:3000/pricing
- **Self-serve registration:** http://localhost:3000/register

## Milestones (build order)

1. **Tap Page + append** — `GET /t/[tagId]`, `POST /api/log` (append-only, server timestamp)
2. **Admin** — `/admin`: onboard clients, assign template pack, register tags, reassign meaning, export placement list
3. **Dashboard** — `/dashboard`: live compliance %, counts, per-tag status, confidence-first
4. **PDF report** — `GET /api/report?client=&from=&to=` (read-only, reconciles with data)
5. **Alerts feed** — overdue tags surface in-dashboard; auto-clear on next valid log

## Template packs

Log types are configuration, not hardcode (`src/lib/packs.ts`): `warehouse`,
`healthcare`, `construction`, `foodservice`, `hospitality`, `retail`,
`education`, `manufacturing`, and `other`.

## Supabase setup (production)

1. Create a Supabase project (free tier is fine).
2. In the dashboard: **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and **Run**. This creates the
   operational tables, account profiles, billing metadata, issue workflow,
   staff roster, report preferences, append-only triggers, RLS, and a demo seed.
   It is idempotent and must be re-run after schema updates.
3. Set env vars (locally in `.env.local`, and in Vercel → Project → Settings →
   Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (server-only)
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - Stripe, Resend, and cron variables listed in `.env.example`
4. Set `SENTINEL_ADMIN_EMAIL` and a 12+ character
   `SENTINEL_ADMIN_PASSWORD` locally, then run `npm run bootstrap:admin` once.

Append-only is enforced *in the database* by a trigger that blocks UPDATE/DELETE
on `log_entries` — even for the service-role key.

## Hard guardrails (enforced in code)

- Log Entries are **append-only** — no update/delete path anywhere.
- Timestamps are **server-set**; client time is never trusted.
- Supabase and Stripe secret credentials are **server-side only**.
- No native app; no login at the point of use.
- Charcoal is product-UI chrome only — never a full-section marketing background.
