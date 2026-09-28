-- ============================================================
-- Allow using the profile avatar as the Open Graph share image
-- ============================================================
ALTER TABLE "public"."site_config"
  ADD COLUMN IF NOT EXISTS "use_avatar_as_og_image" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN "public"."site_config"."use_avatar_as_og_image" IS 'When true, the profile avatar is used as og:image for pages without their own image';
