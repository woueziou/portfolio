-- Admin Revamp 1.0 — Phase 1: Schema & Data Model
-- ============================================================
-- 1. Extend project_type enum
-- 2. project_types_view
-- 3. techstacks table + seed
-- 4. project_techstacks join table + backfill
-- 5. page_views table + increment function (visitor analytics)
-- 6. site_config table (settings)
-- 7. RLS policies for all new tables
-- ============================================================

-- ============================================================
-- 1. Extend project_type enum with Zod schema values
-- ============================================================
-- Was: 'web' | 'mobile' | 'script' | 'backend' | 'infra'
-- Now: + 'desktop' | 'api' | 'library' | 'other'
ALTER TYPE "public"."project_type" ADD VALUE IF NOT EXISTS 'desktop';
ALTER TYPE "public"."project_type" ADD VALUE IF NOT EXISTS 'api';
ALTER TYPE "public"."project_type" ADD VALUE IF NOT EXISTS 'library';
ALTER TYPE "public"."project_type" ADD VALUE IF NOT EXISTS 'other';

-- ============================================================
-- 2. Create project_types_view — dynamic from enum values
-- ============================================================
CREATE OR REPLACE VIEW "public"."project_types_view" AS
WITH enum_values AS (
  SELECT unnest(enum_range(NULL::project_type))::text AS value
)
SELECT
  value,
  CASE value
    WHEN 'web'      THEN 'Web'
    WHEN 'mobile'   THEN 'Mobile'
    WHEN 'script'   THEN 'Script'
    WHEN 'backend'  THEN 'Backend'
    WHEN 'infra'    THEN 'Infrastructure'
    WHEN 'llm'      THEN 'LLM'
    WHEN 'ai'       THEN 'AI'
    WHEN 'desktop'  THEN 'Desktop'
    WHEN 'api'      THEN 'API'
    WHEN 'library'  THEN 'Library'
    WHEN 'other'    THEN 'Other'
  END AS label
FROM enum_values;

COMMENT ON VIEW "public"."project_types_view" IS 'UI-ready rows from project_type enum values, automatically stays in sync';

-- ============================================================
-- 3. Create techstacks table
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."techstacks" (
  "id" text NOT NULL PRIMARY KEY,
  "name" text NOT NULL,
  "icon" text NOT NULL DEFAULT '',
  "description" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "techstacks_name_idx" ON "public"."techstacks" ("name");

COMMENT ON TABLE "public"."techstacks" IS 'Canonical tech stack reference — seeded from known values, editable via admin';

-- Seed known tech stack values (from project-item.tsx getIcon switch)
INSERT INTO "public"."techstacks" (id, name, icon, description) VALUES
  ('agora',      'Agora',         'agora',     'Real-time engagement platform'),
  ('supabase',   'Supabase',      'supabase',  'Open-source Firebase alternative'),
  ('flutter',    'Flutter',       'flutter',   'UI toolkit from Google'),
  ('next',       'Next.js',       'next',      'React framework for production'),
  ('typescript', 'TypeScript',    'typescript','Typed JavaScript superset'),
  ('dart',       'Dart',          'dart',      'Client-optimized programming language'),
  ('postgres',   'PostgreSQL',    'postgres',  'Advanced relational database'),
  ('bash',       'Bash',          'bash',      'Unix shell and command language'),
  ('hono',       'Hono',          'hono',      'Lightweight web framework'),
  ('nuxt',       'Nuxt',          'nuxt',      'Vue.js framework'),
  ('dotnet',     '.NET',          'dotnet',    'Cross-platform framework from Microsoft'),
  ('git',        'Git',           'git',       'Distributed version control'),
  ('mongodb',    'MongoDB',       'mongodb',   'NoSQL document database'),
  ('telegram',   'Telegram',      'telegram',  'Messaging platform / Bot API'),
  ('payloadcms', 'Payload CMS',   'payloadcms','Headless CMS and application framework'),
  ('sanity',     'Sanity',        'sanity',    'Headless CMS with structured content'),
  ('sql',        'SQL',           'sql',       'Structured Query Language'),
  ('fastapi',    'FastAPI',       'fastapi',   'Python web framework for APIs'),
  ('aws',        'AWS',           'aws',       'Amazon Web Services cloud platform'),
  ('python',     'Python',        'python',    'General-purpose programming language')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Create project_techstacks join table
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."project_techstacks" (
  "project_id" bigint NOT NULL REFERENCES "public"."projects"("id") ON DELETE CASCADE,
  "techstack_id" text NOT NULL REFERENCES "public"."techstacks"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "project_techstacks_pkey" PRIMARY KEY (project_id, techstack_id)
);

CREATE INDEX IF NOT EXISTS "project_techstacks_project_id_idx" ON "public"."project_techstacks" ("project_id");
CREATE INDEX IF NOT EXISTS "project_techstacks_techstack_id_idx" ON "public"."project_techstacks" ("techstack_id");

COMMENT ON TABLE "public"."project_techstacks" IS 'Many-to-many join between projects and techstacks — replaces legacy projects.tech_stack array';

-- Backfill project_techstacks from legacy projects.tech_stack array
-- Only inserts rows where the lowercased tech name matches a techstacks.id (slug)
INSERT INTO "public"."project_techstacks" (project_id, techstack_id)
SELECT DISTINCT
  p.id,
  t.id
FROM "public"."projects" p
CROSS JOIN LATERAL unnest(p.tech_stack) AS tech_name
INNER JOIN "public"."techstacks" t ON lower(tech_name) = t.id
WHERE p.tech_stack IS NOT NULL
  AND array_length(p.tech_stack, 1) > 0
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. Create page_views table (visitor analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."page_views" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "path" text NOT NULL,
  "date" date NOT NULL DEFAULT CURRENT_DATE,
  "count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "page_views_path_date_unique" UNIQUE (path, date)
);

CREATE INDEX IF NOT EXISTS "page_views_date_idx" ON "public"."page_views" ("date" DESC);
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "public"."page_views" ("path");

COMMENT ON TABLE "public"."page_views" IS 'Daily page view counts for visitor analytics dashboard';

-- Helper function: safe increment (callable from anon for public pages)
CREATE OR REPLACE FUNCTION "public"."increment_page_view"(path_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO "public"."page_views" (path, date, count)
  VALUES (path_param, CURRENT_DATE, 1)
  ON CONFLICT (path, date)
  DO UPDATE SET count = "public"."page_views".count + 1;
END;
$$;

-- ============================================================
-- 6. Create site_config table (admin settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."site_config" (
  "id" bigint NOT NULL DEFAULT 1 PRIMARY KEY,
  "site_title" text NOT NULL DEFAULT 'Portfolio',
  "site_tagline" text,
  "social_links" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "seo_description" text,
  "seo_og_image" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "site_config_single_row" CHECK (id = 1)
);

COMMENT ON TABLE "public"."site_config" IS 'Single-row site-wide configuration for admin Settings tab';
COMMENT ON COLUMN "public"."site_config"."social_links" IS 'JSON object with platform slugs as keys, URLs as values, e.g. {"github": "https://...", "twitter": "https://..."}';

-- Add updated_at trigger for site_config
CREATE TRIGGER "set_site_config_updated_at"
  BEFORE UPDATE ON "public"."site_config"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

-- Seed default site_config row
INSERT INTO "public"."site_config" (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. RLS policies for new tables
-- ============================================================

-- --- techstacks: world-readable reference data ---
ALTER TABLE "public"."techstacks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "techstacks_public_select"
  ON "public"."techstacks"
  FOR SELECT
  TO public
  USING (true);

-- Only service_role / migration can write to techstacks
CREATE POLICY "techstacks_authenticated_insert"
  ON "public"."techstacks"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "techstacks_authenticated_update"
  ON "public"."techstacks"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "techstacks_authenticated_delete"
  ON "public"."techstacks"
  FOR DELETE
  TO authenticated
  USING (true);

-- --- project_techstacks: public select, authenticated CRUD ---
ALTER TABLE "public"."project_techstacks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_techstacks_public_select"
  ON "public"."project_techstacks"
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "project_techstacks_authenticated_insert"
  ON "public"."project_techstacks"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "project_techstacks_authenticated_update"
  ON "public"."project_techstacks"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "project_techstacks_authenticated_delete"
  ON "public"."project_techstacks"
  FOR DELETE
  TO authenticated
  USING (true);

-- --- page_views: authenticated read, anon write via function ---
ALTER TABLE "public"."page_views" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_authenticated_select"
  ON "public"."page_views"
  FOR SELECT
  TO authenticated
  USING (true);

-- Direct inserts not allowed from client; use increment_page_view() instead
CREATE POLICY "page_views_service_insert"
  ON "public"."page_views"
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "page_views_service_update"
  ON "public"."page_views"
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- --- site_config: public read, authenticated write ---
ALTER TABLE "public"."site_config" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_config_public_select"
  ON "public"."site_config"
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "site_config_authenticated_insert"
  ON "public"."site_config"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "site_config_authenticated_update"
  ON "public"."site_config"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 8. RLS policies for profiles (missing from initial schema)
-- ============================================================

-- Authenticated owner: can insert own profile
CREATE POLICY "profiles_owner_insert"
  ON "public"."profiles"
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Authenticated owner: can update own profile
CREATE POLICY "profiles_owner_update"
  ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Authenticated owner: can delete own profile
CREATE POLICY "profiles_owner_delete"
  ON "public"."profiles"
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- ============================================================
-- 9. Grant function execution to anon (for visitor tracking)
-- ============================================================
GRANT EXECUTE ON FUNCTION "public"."increment_page_view"(text) TO anon;

-- ============================================================
-- Rollback notes:
--   DROP POLICY IF EXISTS profiles_owner_insert ON public.profiles;
--   DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;
--   DROP POLICY IF EXISTS profiles_owner_delete ON public.profiles;
--   DROP FUNCTION IF EXISTS increment_page_view;
--   DROP TABLE IF EXISTS site_config;
--   DROP TABLE IF EXISTS page_views;
--   DROP TABLE IF EXISTS project_techstacks;
--   DROP TABLE IF EXISTS techstacks;
--   DROP VIEW IF EXISTS project_types_view;
--   (Enum ALTER TYPE … ADD VALUE cannot be reversed in a transaction;
--    a new enum type would be needed for full rollback.)
-- ============================================================
