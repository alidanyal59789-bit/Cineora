-- Cineora Phase 1: Auth + Watchlist + Collections
-- Run this in Supabase Dashboard -> SQL Editor (once).
-- Safe to re-run: uses IF NOT EXISTS guards where possible.

create extension if not exists "pgcrypto";

-- 1. Profiles (one row per auth.users id)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- 2. Watchlist items (one row per movie per user)
create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id integer not null,
  movie jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);
create index if not exists watchlist_items_user_idx on public.watchlist_items (user_id);

-- 3. User collections (lists)
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists collections_user_idx on public.collections (user_id);

-- 4. Collection items (movies inside a collection)
create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  movie_id integer not null,
  movie jsonb not null,
  created_at timestamptz not null default now(),
  unique (collection_id, movie_id)
);
create index if not exists collection_items_collection_idx on public.collection_items (collection_id);

-- 5. Row Level Security
alter table public.profiles enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

-- Drop old policies if re-running (Postgres has no CREATE POLICY IF NOT EXISTS)
drop policy if exists "profiles_owner" on public.profiles;
drop policy if exists "watchlist_owner" on public.watchlist_items;
drop policy if exists "collections_owner" on public.collections;
drop policy if exists "collection_items_owner" on public.collection_items;

create policy "profiles_owner" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "watchlist_owner" on public.watchlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "collections_owner" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "collection_items_owner" on public.collection_items
  for all using (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id
      and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id
      and c.user_id = auth.uid()
    )
  );

-- 6. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
