-- ============================================================
-- Epic #17 (Performance) — T0: tighten leftover public-read policies
-- ============================================================
-- The initial remote schema created blanket `allow_public_access`
-- (SELECT ... USING (true), role public) policies. projects and articles
-- were already replaced in 20260603000000_phase1_schema_evolution.sql;
-- profiles and contact_providers still carry the blanket policy.
--
-- The site reads these tables with the anon key at build time, so the
-- exposure must be explicit:
--   * contact_providers: not read anywhere in apps/web -> no anon access.
--   * profiles: the site reads first_name, last_name, title, description,
--     avatar_url, username. The table holds no private column (no email),
--     socials/skills are meant to be public -> keep read access, but as a
--     named policy limited to anon + authenticated instead of `public`.
--
-- Rollback:
--   DROP POLICY IF EXISTS "profiles_public_select" ON "public"."profiles";
--   CREATE POLICY "allow_public_access" ON "public"."profiles" FOR SELECT USING (true);
--   CREATE POLICY "allow_public_access" ON "public"."contact_providers" FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_access" ON "public"."contact_providers";
DROP POLICY IF EXISTS "allow_public_access" ON "public"."profiles";

CREATE POLICY "profiles_public_select"
  ON "public"."profiles"
  FOR SELECT
  TO anon, authenticated
  USING (true);
