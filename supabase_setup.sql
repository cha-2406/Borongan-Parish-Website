-- ============================================================
-- Borongan Cathedral Parish — Supabase setup
-- Run this once in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query → paste all of this → Run)
-- ============================================================

create extension if not exists pgcrypto;

-- One table holds both certificate requests and service bookings,
-- distinguished by the "type" column.
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  type text not null check (type in ('certificate','booking')),
  status text not null,
  requestor_name text not null,
  contact_number text,
  email text,
  certificate_type text,
  service_type text,
  subject_name text,
  sacrament_date text,
  purpose text,
  delivery_method text,
  preferred_date date,
  preferred_time time,
  notes text,
  history jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Generates reference numbers like BOR-2026-0001, atomically.
create sequence if not exists request_ref_seq start 1;

create or replace function next_ref()
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('request_ref_seq');
  return 'BOR-' || extract(year from now())::text || '-' || lpad(n::text, 4, '0');
end;
$$;

-- Row Level Security: the site uses Supabase's public "anon" key,
-- so these policies control what a visitor's browser can do directly.
alter table requests enable row level security;

create policy "Public can submit requests"
  on requests for insert
  to anon
  with check (true);

create policy "Public can read requests (for tracking + office view)"
  on requests for select
  to anon
  using (true);

create policy "Public can update status (used by office dashboard)"
  on requests for update
  to anon
  using (true)
  with check (true);

-- ------------------------------------------------------------
-- IMPORTANT SECURITY NOTE
-- ------------------------------------------------------------
-- These policies are intentionally permissive so the site works
-- with no separate backend. In practice this means:
--   • Anyone with your anon key (visible in the page source) can
--     read every row in this table, and can update any status.
--   • The "Parish Office" passcode in the website is a UI gate
--     only — it does not stop direct API calls.
--
-- Before this goes live for real parishioners, replace the
-- "select" and "update" policies with ones that require a signed-in
-- staff account (Supabase Auth), e.g.:
--
--   create policy "Staff can read all requests"
--     on requests for select
--     to authenticated
--     using (true);
--
--   create policy "Staff can update requests"
--     on requests for update
--     to authenticated
--     using (true) with check (true);
--
-- and change "Public can read requests" to only allow reading a
-- single row matched by ref (e.g. via a Postgres function) rather
-- than the whole table.
