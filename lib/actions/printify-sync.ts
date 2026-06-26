"use server";

import { db } from "@/lib/db";
import { products, productVariants, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { printify } from "@/lib/printify";
import { revalidatePath } from "next/cache";

/**
 * Compute the final sell price for a variant.
 *
 * Priority:
 *   1. Per-variant markupPercentage (if > 0)
 *   2. Product-level markupPercentage (if > 0)
 *   3. No markup → sell price = cost price
 */
function applyMarkup(
  costPrice: number,
  variantMarkup: number,
  productMarkup: number
): string {
  const markup = variantMarkup > 0 ? variantMarkup : productMarkup;
  return (costPrice * (1 + markup / 100)).toFixed(2);
}

export async function syncPrintifyCatalogAction() {
  try {
    // 1. Ensure "Print-on-Demand" category exists (upsert-safe)
    let category = await db.query.categories.findFirst({
      where: eq(categories.slug, "print-on-demand"),
    });

    if (!category) {
      const [newCategory] = await db
        .insert(categories)
        .values({
          name: "Print-on-Demand",
          slug: "print-on-demand",
          description:
            "Automated print-on-demand products from the Printify network.",
        })
        .onConflictDoNothing()
        .returning();

      if (!newCategory) {
        category = await db.query.categories.findFirst({
          where: eq(categories.slug, "print-on-demand"),
        });
      } else {
        category = newCategory;
      }
    }

    if (!category) {
      throw new Error("Failed to resolve Print-on-Demand category.");
    }

    // 2. Fetch products from Printify
    const printifyData = await printify.getProducts();
    const printifyProducts = printifyData.data || [];

    let updatedCount = 0;
    let createdCount = 0;

    for (const p of printifyProducts) {
      // Fetch existing product — include variants so we can preserve per-variant markups
      const existingProduct = await db.query.products.findFirst({
        where: eq(products.supplierProductId, p.id),
        with: { variants: true },
      });

      // Preserve admin-set markup percentages on re-sync
      const productMarkup = existingProduct?.markupPercentage ?? 0;

      let productId: string;

      const cleanSlug = `${p.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")}-${p.id.slice(-4)}`;

      if (existingProduct) {
        await db
          .update(products)
          .set({
            name: p.title,
            slug: cleanSlug,
            description: p.description,
            images: p.images.map((img: any) => img.src),
            // Do NOT overwrite markupPercentage — admin sets this manually
            updatedAt: new Date(),
          })
          .where(eq(products.id, existingProduct.id));
        productId = existingProduct.id;
        updatedCount++;
      } else {
        const [newProduct] = await db
          .insert(products)
          .values({
            name: p.title,
            slug: cleanSlug,
            description: p.description,
            type: "pod",
            categoryId: category.id,
            images: p.images.map((img: any) => img.src),
            supplierProductId: p.id,
            markupPercentage: 0, // Admin sets this after first sync
          })
          .returning();
        productId = newProduct.id;
        createdCount++;
      }

      // 3. Sync variants — only enabled ones
      const enabledVariants = p.variants.filter((v: any) => v.is_enabled);

      for (const v of enabledVariants) {
        const supplierVid = v.id.toString();

        const existingVariant = await db.query.productVariants.findFirst({
          where: and(
            eq(productVariants.productId, productId),
            eq(productVariants.supplierVariantId, supplierVid)
          ),
        });

        // Printify stores prices in cents
        const costPrice = v.price / 100;

        // Generate a unique SKU if Printify doesn't provide one
        const sku =
          v.sku && v.sku.trim() !== ""
            ? v.sku
            : `PFY-${p.id.slice(0, 6)}-${supplierVid}`;

        if (existingVariant) {
          // Preserve per-variant markup set by admin
          const variantMarkup = existingVariant.markupPercentage ?? 0;
          const finalPrice = applyMarkup(
            costPrice,
            variantMarkup,
            productMarkup
          );

          await db
            .update(productVariants)
            .set({
              name: v.title,
              sku: sku,
              price: finalPrice,
              costPrice: costPrice.toFixed(2),
              inventory: 999,
              // markupPercentage intentionally NOT overwritten
            })
            .where(eq(productVariants.id, existingVariant.id));
        } else {
          // New variant — inherit product-level markup as default
          const finalPrice = applyMarkup(costPrice, 0, productMarkup);

          await db.insert(productVariants).values({
            productId: productId,
            name: v.title,
            sku: sku,
            price: finalPrice,
            costPrice: costPrice.toFixed(2),
            markupPercentage: 0, // 0 = use product-level markup
            supplierVariantId: supplierVid,
            inventory: 999,
          });
        }
      }
    }

    revalidatePath("/dashboard/admin/products");
    return {
      success: true,
      message: `Sync complete: ${createdCount} products created, ${updatedCount} products updated.`,
    };
  } catch (error: any) {
    console.error("Printify Sync Error:", error);
    return { success: false, error: error.message };
  }
}
