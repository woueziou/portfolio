-- Add published_at column to articles table
-- This was missed in Phase 1 but is needed for the publication workflow

ALTER TABLE "public"."articles"
  ADD COLUMN "published_at" timestamp with time zone;
