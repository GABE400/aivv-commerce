-- Add per-variant markup percentage column
-- 0 means "inherit product-level markup" (the default behaviour)
ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "markupPercentage" integer DEFAULT 0;
