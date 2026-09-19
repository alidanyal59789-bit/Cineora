-- Cineora: Personal Collections - optional description
-- Run this in Supabase Dashboard -> SQL Editor (once, after 0001_phase1_auth.sql).
-- Safe, additive, re-runnable: only adds a nullable-free text column with a
-- default so existing rows are untouched. No RLS or policy changes (the
-- existing "collections_owner" policy already covers all operations on rows
-- owned by auth.uid()).

alter table public.collections
  add column if not exists description text not null default '';
