ALTER TABLE "cj_connection" ADD COLUMN "shopId" text;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "costPrice" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "markupPercentage" integer DEFAULT 0;