"use server";

import { db } from "@/lib/db";
import { products, productVariants, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { printify } from "@/lib/printify";
import { revalidatePath } from "next/cache";

/**
 * Printify variant fields:
 *   price         – production cost in cents  (e.g. 1299 = $12.99)
 *   retail_price  – the price the creator set in the Printify dashboard, also cents
 *                   This is Printify's "profit range" value.
 *                   profit = retail_price - price
 *
 * Strategy on first sync:
 *   • costPrice  = price / 100          (what Printify charges us)
 *   • retailPrice = retail_price / 100  (Printify's own suggested sell price — stored for reference)
 *   • price (sell) = retail_price / 100 by default so profit is immediately visible
 *
 * On re-sync we preserve any sell price the admin already edited, only
 * updating costPrice and retailPrice from Printify.
 *
 * If the admin has also set a markup percentage we apply that instead.
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
    // 1. Ensure "Print-on-Demand" category exists
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

      category =
        newCategory ??
        (await db.query.categories.findFirst({
          where: eq(categories.slug, "print-on-demand"),
        }));
    }

    if (!category)
      throw new Error("Failed to resolve Print-on-Demand category.");

    // 2. Fetch products from Printify
    const printifyData = await printify.getProducts();
    const printifyProducts = printifyData.data || [];

    let updatedCount = 0;
    let createdCount = 0;

    for (const p of printifyProducts) {
      const existingProduct = await db.query.products.findFirst({
        where: eq(products.supplierProductId, p.id),
        with: { variants: true },
      });

      // Never overwrite admin-set markup
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
            // markupPercentage intentionally NOT overwritten
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
            markupPercentage: 0,
          })
          .returning();
        productId = newProduct.id;
        createdCount++;
      }

      // 3. Sync enabled variants
      const enabledVariants = (p.variants as any[]).filter((v) => v.is_enabled);

      for (const v of enabledVariants) {
        const supplierVid = v.id.toString();

        const existingVariant = await db.query.productVariants.findFirst({
          where: and(
            eq(productVariants.productId, productId),
            eq(productVariants.supplierVariantId, supplierVid)
          ),
        });

        // Printify prices are in cents
        const costPrice = v.price / 100;

        // retail_price is Printify's own suggested sell price — this IS the profit range
        // It may be 0 if the creator never set a retail price in Printify dashboard
        const printifyRetailPrice =
          typeof v.retail_price === "number" && v.retail_price > 0
            ? v.retail_price / 100
            : null;

        const sku =
          v.sku && v.sku.trim() !== ""
            ? v.sku
            : `PFY-${p.id.slice(0, 6)}-${supplierVid}`;

        if (existingVariant) {
          // Preserve admin markup
          const variantMarkup = existingVariant.markupPercentage ?? 0;

          // If admin set a markup, recompute sell price from cost
          // Otherwise keep the existing price (admin may have manually edited it)
          const hasAdminMarkup = variantMarkup > 0 || productMarkup > 0;
          const newSellPrice = hasAdminMarkup
            ? applyMarkup(costPrice, variantMarkup, productMarkup)
            : existingVariant.price; // keep whatever admin set

          await db
            .update(productVariants)
            .set({
              name: v.title,
              sku,
              // Always refresh cost and Printify's retail price from the API
              costPrice: costPrice.toFixed(2),
              retailPrice: printifyRetailPrice
                ? printifyRetailPrice.toFixed(2)
                : existingVariant.retailPrice,
              price: newSellPrice,
              inventory: 999,
              // markupPercentage intentionally NOT overwritten
            })
            .where(eq(productVariants.id, existingVariant.id));
        } else {
          // New variant — use Printify's retail_price as the initial sell price
          // so admin immediately sees the profit Printify recommends
          const initialSellPrice =
            productMarkup > 0
              ? applyMarkup(costPrice, 0, productMarkup)
              : printifyRetailPrice
              ? printifyRetailPrice.toFixed(2)
              : costPrice.toFixed(2); // fallback: no markup, cost = sell

          await db.insert(productVariants).values({
            productId,
            name: v.title,
            sku,
            price: initialSellPrice,
            costPrice: costPrice.toFixed(2),
            retailPrice: printifyRetailPrice
              ? printifyRetailPrice.toFixed(2)
              : null,
            markupPercentage: 0,
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
