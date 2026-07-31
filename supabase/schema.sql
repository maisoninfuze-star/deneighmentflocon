-- ===========================================================================
-- Déneigement Flocons — Supabase schema
--
-- Run this in the Supabase SQL editor once, then set the three NEXT_PUBLIC_/
-- SUPABASE_ env vars. Until then the site uses local-file fallbacks and works
-- without a database.
-- ===========================================================================

-- Estimate requests -----------------------------------------------------------
create table if not exists public.estimates (
  reference       text primary key,
  status          text not null default 'new'
                    check (status in ('new','contacted','quoted','won','lost')),
  locale          text not null default 'fr',
  service_type    text not null,
  property_type   text not null,
  driveway_length numeric,
  driveway_width  numeric,
  unit            text,
  area_sq_ft      integer,
  vehicles        integer,
  walkways        boolean default false,
  garage          boolean default false,
  stairs          boolean default false,
  sidewalk        boolean default false,
  deicing         boolean default false,
  obstacles       text,
  notes           text,
  admin_notes     text,
  photos          jsonb not null default '[]'::jsonb,
  name            text not null,
  phone           text not null,
  email           text not null,
  address         text,
  city            text,
  postal_code     text,
  consent         boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists estimates_created_at_idx on public.estimates (created_at desc);
create index if not exists estimates_status_idx on public.estimates (status);

-- Contact messages ------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null,
  message    text not null,
  status     text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz not null default now()
);
create index if not exists contact_created_at_idx on public.contact_messages (created_at desc);

-- Editable site settings (single row) -----------------------------------------
create table if not exists public.site_settings (
  id         text primary key default 'site',
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security ----------------------------------------------------------
-- Writes come only from server routes using the service-role key, which
-- bypasses RLS. Enable RLS with NO public policies so the anon key (browser)
-- can neither read nor write these tables.
alter table public.estimates        enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings    enable row level security;

-- Storage bucket for estimate photos ------------------------------------------
insert into storage.buckets (id, name, public)
values ('estimate-photos', 'estimate-photos', true)
on conflict (id) do nothing;
