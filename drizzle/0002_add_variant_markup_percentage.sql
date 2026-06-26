-- Add per-variant markup percentage column
-- 0 means "inherit product-level markup" (the default behaviour)
ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "markupPercentage" integer DEFAULT 0;

-- Add retailPrice column to store Printify's suggested retail price (retail_price field)
-- This lets the admin see what Printify set vs what they've overridden
ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "retailPrice" numeric(10, 2);
