-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table if not exists public.contact_submissions (
  id          bigserial primary key,
  created_at  timestamptz default now() not null,
  first_name  text,
  last_name   text,
  email       text not null,
  topic       text not null,
  message     text not null
);

-- Enable Row Level Security
alter table public.contact_submissions enable row level security;

-- Allow anonymous inserts (form submissions from the website)
create policy "Allow anonymous inserts"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- Only authenticated users (admins) can read submissions
create policy "Allow authenticated reads"
  on public.contact_submissions
  for select
  to authenticated
  using (true);
