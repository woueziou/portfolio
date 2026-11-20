-- ============================================================
-- Ticket #48: drop the unused contact_providers table
-- ============================================================
-- Left over from the initial schema. Checked in production before dropping:
-- 0 rows, no foreign key in either direction, no dependent view, no policy
-- (its public read policy was removed by 20261119100000), and no reference in
-- apps/web.
--
-- Rollback: recreate it from 20260602162639_remote_schema.sql (id bigint identity
-- primary key, created_at timestamptz, name text, url text, description text).

drop table if exists public.contact_providers;
