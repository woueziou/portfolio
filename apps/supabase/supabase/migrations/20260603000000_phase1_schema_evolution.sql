-- Phase 1: Database Schema Evolution
-- Adds publication fields to projects & articles, updated_at triggers,
-- publication-aware RLS policies, and content-images storage bucket.
-- Only touches the public schema.

-- ============================================================
-- 1. Publication status enum
-- ============================================================
CREATE TYPE "public"."publication_status" AS ENUM ('draft', 'published', 'archived');

-- ============================================================
-- 2. Alter projects table
-- ============================================================
ALTER TABLE "public"."projects"
  ADD COLUMN "slug" text,
  ADD COLUMN "publication_status" "public"."publication_status" NOT NULL DEFAULT 'draft',
  ADD COLUMN "published_at" timestamp with time zone,
  ADD COLUMN "access_link" text,
  ADD COLUMN "updated_at" timestamp with time zone NOT NULL DEFAULT now();

-- Backfill slug from title (lowercase, replace non-alphanum with hyphens)
UPDATE "public"."projects"
   SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));

-- Now enforce NOT NULL + unique
ALTER TABLE "public"."projects"
  ALTER COLUMN "slug" SET NOT NULL,
  ADD CONSTRAINT "projects_slug_unique" UNIQUE ("slug");

-- ============================================================
-- 3. Alter articles table
-- ============================================================
ALTER TABLE "public"."articles"
  ADD COLUMN "slug" text,
  ADD COLUMN "content" jsonb,
  ADD COLUMN "content_html" text,
  ADD COLUMN "status" "public"."publication_status" NOT NULL DEFAULT 'draft',
  ADD COLUMN "project_id" bigint,
  ADD COLUMN "reading_time_minutes" integer,
  ADD COLUMN "updated_at" timestamp with time zone NOT NULL DEFAULT now();

-- Backfill slug from title
UPDATE "public"."articles"
   SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));

ALTER TABLE "public"."articles"
  ALTER COLUMN "slug" SET NOT NULL,
  ADD CONSTRAINT "articles_slug_unique" UNIQUE ("slug"),
  ADD CONSTRAINT "articles_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id")
    ON DELETE SET NULL;

-- ============================================================
-- 4. updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_projects_updated_at"
  BEFORE UPDATE ON "public"."projects"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_articles_updated_at"
  BEFORE UPDATE ON "public"."articles"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX "projects_slug_idx" ON "public"."projects" ("slug");
CREATE INDEX "projects_publication_status_idx" ON "public"."projects" ("publication_status");
CREATE INDEX "articles_slug_idx" ON "public"."articles" ("slug");
CREATE INDEX "articles_status_idx" ON "public"."articles" ("status");
CREATE INDEX "articles_project_id_idx" ON "public"."articles" ("project_id");

-- ============================================================
-- 6. Replace RLS policies — publication-aware
-- ============================================================

-- Drop old permissive public-read policies
DROP POLICY IF EXISTS "allow_public_access" ON "public"."projects";
DROP POLICY IF EXISTS "allow_public_access" ON "public"."articles";

-- --- Projects policies ---

-- Anonymous / public: can only read published projects
CREATE POLICY "projects_public_select"
  ON "public"."projects"
  FOR SELECT
  TO anon
  USING (publication_status = 'published');

-- Authenticated: can read published projects (same as anon for public reads)
CREATE POLICY "projects_authenticated_select_published"
  ON "public"."projects"
  FOR SELECT
  TO authenticated
  USING (publication_status = 'published');

-- Authenticated owner: can read ALL own projects (draft / published / archived)
CREATE POLICY "projects_owner_select_all"
  ON "public"."projects"
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated owner: can insert own projects
CREATE POLICY "projects_owner_insert"
  ON "public"."projects"
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated owner: can update own projects
CREATE POLICY "projects_owner_update"
  ON "public"."projects"
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Authenticated owner: can delete own projects
CREATE POLICY "projects_owner_delete"
  ON "public"."projects"
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- --- Articles policies ---

-- Anonymous / public: can only read published articles
CREATE POLICY "articles_public_select"
  ON "public"."articles"
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Authenticated: can read published articles
CREATE POLICY "articles_authenticated_select_published"
  ON "public"."articles"
  FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Authenticated owner: can read ALL own articles (draft / published / archived)
CREATE POLICY "articles_owner_select_all"
  ON "public"."articles"
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated owner: can insert own articles
CREATE POLICY "articles_owner_insert"
  ON "public"."articles"
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated owner: can update own articles
CREATE POLICY "articles_owner_update"
  ON "public"."articles"
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Authenticated owner: can delete own articles
CREATE POLICY "articles_owner_delete"
  ON "public"."articles"
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 7. Supabase Storage: content-images bucket + policies
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to content-images
CREATE POLICY "content_images_authenticated_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content-images');

-- Public read access to content-images
CREATE POLICY "content_images_public_select"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'content-images');

-- Authenticated users can update their own uploads
CREATE POLICY "content_images_authenticated_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content-images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'content-images' AND owner = auth.uid());

-- Authenticated users can delete their own uploads
CREATE POLICY "content_images_authenticated_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'content-images' AND owner = auth.uid());

-- ============================================================
-- 8. Verification queries (run after supabase db reset)
-- ============================================================
-- Uncomment and run manually to verify:
--
-- -- publication_status defaults to 'draft'
-- SELECT column_name, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'projects' AND column_name = 'publication_status';
--
-- -- article project_id is nullable
-- SELECT is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'articles' AND column_name = 'project_id';
--
-- -- updated_at trigger exists
-- SELECT trigger_name, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE '%updated_at%';
--
-- -- Indexes exist
-- SELECT indexname FROM pg_indexes
-- WHERE tablename IN ('projects', 'articles')
--   AND indexname LIKE '%slug%' OR indexname LIKE '%status%' OR indexname LIKE '%project_id%';
--
-- -- RLS policies count
-- SELECT tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN ('projects', 'articles')
-- ORDER BY tablename, policyname;
--
-- -- Storage bucket exists
-- SELECT id, name, public FROM storage.buckets WHERE id = 'content-images';
