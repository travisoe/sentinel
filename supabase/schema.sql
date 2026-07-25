-- Sentinel Compliance Platform — Supabase schema (SOUL §13.3, §13.8)
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  name       text primary key,
  pack       text not null default 'warehouse',
  status     text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  tag_id         text primary key,                     -- CLIENT-###, unique across all clients
  client         text not null references public.clients(name) on update cascade,
  location       text not null default '',
  log_type       text not null default '',
  frequency_days integer not null default 7,
  install_date   date,
  status         text not null default 'Active',
  created_at     timestamptz not null default now()
);
create index if not exists tags_client_idx on public.tags (client);

create table if not exists public.log_entries (
  id         bigint generated always as identity primary key,
  ts         timestamptz not null default now(),        -- server-set timestamp
  tag_id     text not null references public.tags(tag_id) on update cascade,
  logged_by  text not null,
  notes      text,
  photo_url  text
);
create index if not exists log_entries_tag_idx on public.log_entries (tag_id);
create index if not exists log_entries_ts_idx  on public.log_entries (ts);

-- ---------------------------------------------------------------------------
-- Append-only enforcement: Log Entries can never be updated or deleted.
-- This trigger fires even for the service-role key (SOUL §7.3, §11.5).
-- ---------------------------------------------------------------------------
create or replace function public.prevent_log_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Log Entries are append-only (SOUL 7.3): % is not permitted', tg_op;
end;
$$;

drop trigger if exists log_entries_no_mutation on public.log_entries;
create trigger log_entries_no_mutation
  before update or delete on public.log_entries
  for each row execute function public.prevent_log_mutation();

-- ---------------------------------------------------------------------------
-- Row-Level Security: enabled with NO policies, so the public/anon (publishable)
-- key has zero access. Only the server path via the secret (service-role) key,
-- which bypasses RLS, can read/write.
-- ---------------------------------------------------------------------------
alter table public.clients     enable row level security;
alter table public.tags        enable row level security;
alter table public.log_entries enable row level security;

-- ---------------------------------------------------------------------------
-- Platform accounts, billing, client success, and onboarding
-- ---------------------------------------------------------------------------
alter table public.clients add column if not exists plan text;
alter table public.clients add column if not exists billing_status text not null default 'manual';
alter table public.clients add column if not exists stripe_customer_id text;
alter table public.clients add column if not exists stripe_subscription_id text;
alter table public.clients add column if not exists contact_name text;
alter table public.clients add column if not exists contact_email text;
alter table public.clients add column if not exists contact_phone text;
alter table public.clients add column if not exists station_limit integer;
alter table public.clients add column if not exists health_score integer not null default 100;
alter table public.clients add column if not exists health_band text not null default 'green';
alter table public.clients add column if not exists onboarding_status text not null default 'not_started';
alter table public.clients add column if not exists tags_ordered_at timestamptz;
alter table public.clients add column if not exists tags_shipped_at timestamptz;
alter table public.clients add column if not exists installed_at timestamptz;
alter table public.clients add column if not exists first_scan_at timestamptz;

create unique index if not exists clients_stripe_customer_idx
  on public.clients (stripe_customer_id) where stripe_customer_id is not null;

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'owner' check (role in ('sentinel', 'owner')),
  client     text references public.clients(name) on update cascade on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists profiles_client_idx on public.profiles (client);

create table if not exists public.issues (
  id           bigint generated always as identity primary key,
  client       text not null references public.clients(name) on update cascade on delete cascade,
  tag_id       text references public.tags(tag_id) on update cascade on delete set null,
  type         text not null,
  severity     text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  status       text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  opened_by    text not null,
  opened_at    timestamptz not null default now(),
  acknowledged_by text,
  acknowledged_at timestamptz,
  resolved_by  text,
  resolved_at  timestamptz,
  notes        text,
  resolution   text
);
create index if not exists issues_client_status_idx on public.issues (client, status);
create unique index if not exists issues_one_open_tag_type_idx
  on public.issues (client, tag_id, type)
  where status in ('open', 'acknowledged') and tag_id is not null;

create table if not exists public.corrective_actions (
  id         bigint generated always as identity primary key,
  issue_id   bigint not null references public.issues(id) on delete cascade,
  client     text not null references public.clients(name) on update cascade on delete cascade,
  action     text not null,
  performed_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists corrective_actions_issue_idx on public.corrective_actions (issue_id);
drop trigger if exists corrective_actions_no_mutation on public.corrective_actions;
create trigger corrective_actions_no_mutation
  before update or delete on public.corrective_actions
  for each row execute function public.prevent_log_mutation();

create table if not exists public.staff_roster (
  id         bigint generated always as identity primary key,
  client     text not null references public.clients(name) on update cascade on delete cascade,
  display_name text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  unique (client, display_name)
);

create table if not exists public.report_preferences (
  client       text primary key references public.clients(name) on update cascade on delete cascade,
  weekly_email_enabled boolean not null default false,
  recipient_email text,
  last_sent_at timestamptz,
  updated_at   timestamptz not null default now()
);

create table if not exists public.signup_intents (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  company      text not null,
  contact_name text not null,
  contact_phone text,
  pack         text not null,
  plan         text not null,
  stripe_checkout_session_id text unique,
  status       text not null default 'started',
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.profiles             enable row level security;
alter table public.issues               enable row level security;
alter table public.corrective_actions   enable row level security;
alter table public.staff_roster         enable row level security;
alter table public.report_preferences   enable row level security;
alter table public.signup_intents       enable row level security;

-- Auth helper functions live outside the exposed public schema. They only
-- return the current authenticated user's server-controlled profile values.
create schema if not exists private;

create or replace function private.current_client()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.client
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

create or replace function private.current_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

revoke all on function private.current_client() from public, anon;
revoke all on function private.current_role() from public, anon;
grant execute on function private.current_client() to authenticated;
grant execute on function private.current_role() to authenticated;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "owners read client" on public.clients;
create policy "owners read client"
  on public.clients for select to authenticated
  using (name = (select private.current_client()));

drop policy if exists "owners read tags" on public.tags;
create policy "owners read tags"
  on public.tags for select to authenticated
  using (client = (select private.current_client()));

drop policy if exists "owners read logs" on public.log_entries;
create policy "owners read logs"
  on public.log_entries for select to authenticated
  using (
    exists (
      select 1 from public.tags t
      where t.tag_id = log_entries.tag_id
        and t.client = (select private.current_client())
    )
  );

drop policy if exists "owners read issues" on public.issues;
create policy "owners read issues"
  on public.issues for select to authenticated
  using (client = (select private.current_client()));

drop policy if exists "owners read corrective actions" on public.corrective_actions;
create policy "owners read corrective actions"
  on public.corrective_actions for select to authenticated
  using (client = (select private.current_client()));

drop policy if exists "owners read roster" on public.staff_roster;
create policy "owners read roster"
  on public.staff_roster for select to authenticated
  using (client = (select private.current_client()));

drop policy if exists "owners read report preferences" on public.report_preferences;
create policy "owners read report preferences"
  on public.report_preferences for select to authenticated
  using (client = (select private.current_client()));

grant usage on schema private to authenticated;
grant select on public.profiles, public.clients, public.tags, public.log_entries,
  public.issues, public.corrective_actions, public.staff_roster,
  public.report_preferences to authenticated;

-- ---------------------------------------------------------------------------
-- Demo seed (matches the in-memory demo). Runs only on an empty database.
-- ---------------------------------------------------------------------------
insert into public.clients (name, pack, status)
values ('Demo Warehouse', 'warehouse', 'Active')
on conflict (name) do nothing;

insert into public.tags (tag_id, client, location, log_type, frequency_days, install_date, status) values
  ('DMO-001', 'Demo Warehouse', 'Bay 1 — Forklift #4',            'forklift_preshift',        1,  (now() - interval '30 days')::date, 'Active'),
  ('DMO-002', 'Demo Warehouse', 'Dock Door 3',                     'dock_plate_check',         1,  (now() - interval '30 days')::date, 'Active'),
  ('DMO-003', 'Demo Warehouse', 'Aisle 7 — Racking',               'racking_damage',           7,  (now() - interval '30 days')::date, 'Active'),
  ('DMO-004', 'Demo Warehouse', 'North Emergency Exit',            'emergency_exit',           7,  (now() - interval '30 days')::date, 'Active'),
  ('DMO-005', 'Demo Warehouse', 'Break Room — First-Aid / AED',    'first_aid_aed_eyewash',    30, (now() - interval '30 days')::date, 'Active'),
  ('DMO-006', 'Demo Warehouse', 'Shipping Office — Extinguisher',  'fire_extinguisher_visual', 30, (now() - interval '30 days')::date, 'Active')
on conflict (tag_id) do nothing;

insert into public.log_entries (ts, tag_id, logged_by)
select v.ts, v.tag_id, v.logged_by
from (values
  (now() - interval '5 hours',  'DMO-001', 'J. Rivera'),
  (now() - interval '1 day',    'DMO-001', 'J. Rivera'),
  (now() - interval '2 days',   'DMO-001', 'M. Ostrowski'),
  (now() - interval '31 hours', 'DMO-002', 'M. Ostrowski'),
  (now() - interval '3 days',   'DMO-003', 'T. Cole'),
  (now() - interval '12 days',  'DMO-004', 'T. Cole'),
  (now() - interval '10 days',  'DMO-005', 'A. Patel')
) as v(ts, tag_id, logged_by)
where not exists (select 1 from public.log_entries);
