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
      // Fetch the full product detail — the list endpoint omits retail_price on variants,
      // it only comes back on the individual product endpoint.
      let fullProduct: any;
      try {
        fullProduct = await printify.getProduct(p.id);
      } catch {
        // If single-product fetch fails, fall back to list data
        fullProduct = p;
      }

      const existingProduct = await db.query.products.findFirst({
        where: eq(products.supplierProductId, p.id),
        with: { variants: true },
      });

      // Never overwrite admin-set markup
      const productMarkup = existingProduct?.markupPercentage ?? 0;

      let productId: string;

      const cleanSlug = `${fullProduct.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")}-${p.id.slice(-4)}`;

      if (existingProduct) {
        await db
          .update(products)
          .set({
            name: fullProduct.title,
            slug: cleanSlug,
            description: fullProduct.description,
            images: fullProduct.images.map((img: any) => img.src),
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
            name: fullProduct.title,
            slug: cleanSlug,
            description: fullProduct.description,
            type: "pod",
            categoryId: category.id,
            images: fullProduct.images.map((img: any) => img.src),
            supplierProductId: p.id,
            markupPercentage: 0,
          })
          .returning();
        productId = newProduct.id;
        createdCount++;
      }

      // 3. Sync enabled variants — fullProduct has retail_price per variant
      const enabledVariants = (fullProduct.variants as any[]).filter(
        (v) => v.is_enabled
      );

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

        // retail_price is only set when the creator explicitly configured it in
        // the Printify dashboard. Many accounts never set it, so it may be absent
        // or 0. We try it first, then fall back to a default 40% markup which is
        // Printify's own recommended minimum for a sustainable POD business.
        const DEFAULT_POD_MARKUP = 40; // %

        const printifyRetailPrice =
          typeof v.retail_price === "number" && v.retail_price > 0
            ? v.retail_price / 100
            : null;

        // The "suggested" sell price: Printify's retail_price if set, otherwise
        // cost + 40% — this is what we store as retailPrice for reference.
        const suggestedRetailPrice = printifyRetailPrice
          ? printifyRetailPrice
          : costPrice * (1 + DEFAULT_POD_MARKUP / 100);

        const sku =
          v.sku && v.sku.trim() !== ""
            ? v.sku
            : `PFY-${p.id.slice(0, 6)}-${supplierVid}`;

        if (existingVariant) {
          // Preserve admin markup — recompute sell price only if markup is set,
          // otherwise keep whatever sell price the admin already has.
          const variantMarkup = existingVariant.markupPercentage ?? 0;
          const hasAdminMarkup = variantMarkup > 0 || productMarkup > 0;
          const newSellPrice = hasAdminMarkup
            ? applyMarkup(costPrice, variantMarkup, productMarkup)
            : existingVariant.price;

          await db
            .update(productVariants)
            .set({
              name: v.title,
              sku,
              costPrice: costPrice.toFixed(2),
              retailPrice: suggestedRetailPrice.toFixed(2),
              price: newSellPrice,
              inventory: 999,
            })
            .where(eq(productVariants.id, existingVariant.id));
        } else {
          // New variant — use suggested retail price as the initial sell price
          // so profit is visible immediately without the admin having to do anything.
          const initialSellPrice =
            productMarkup > 0
              ? applyMarkup(costPrice, 0, productMarkup)
              : suggestedRetailPrice.toFixed(2);

          await db.insert(productVariants).values({
            productId,
            name: v.title,
            sku,
            price: initialSellPrice,
            costPrice: costPrice.toFixed(2),
            retailPrice: suggestedRetailPrice.toFixed(2),
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
