-- Life Admin initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#60a5fa',
  icon text not null default 'calendar',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references categories(id) on delete set null,
  start_date date not null,
  recurrence text not null default 'none' check (recurrence in ('none','yearly','monthly')),
  reminder_days_before int[] not null default '{7,1}',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists events_start_date_idx on events(start_date);
create index if not exists events_category_idx on events(category_id);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Seed default categories (idempotent).
insert into categories (name, color, icon) values
  ('Insurance',    '#60a5fa', 'shield'),
  ('Tax',          '#f59e0b', 'receipt'),
  ('Birthday',     '#ec4899', 'cake'),
  ('Anniversary',  '#a78bfa', 'heart'),
  ('Vehicle',      '#10b981', 'car'),
  ('Health',       '#ef4444', 'stethoscope'),
  ('Subscription', '#6366f1', 'credit-card')
on conflict (name) do nothing;
