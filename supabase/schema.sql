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
