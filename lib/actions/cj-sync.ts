"use server";

import { db } from "@/lib/db";
import { products, productVariants, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCJClientForUser, ensureCJShopId } from "@/lib/suppliers/cj-helper";
import { linkProductToCJShopSafe } from "@/lib/suppliers/cj-shop-sync";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

export async function syncCJDropshippingCatalogAction() {
  console.log("syncCJDropshippingCatalogAction called");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    (session.user.role !== "business" && session.user.role !== "admin")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get CJ client for the current user
    const cj = await getCJClientForUser(session.user.id);
    const shopId = await ensureCJShopId(session.user.id, cj);
    console.log("syncCJDropshippingCatalogAction: shopId obtained:", shopId);

    // 1. Ensure "Dropshipping" category exists
    let category = await db.query.categories.findFirst({
      where: eq(categories.slug, "dropshipping"),
    });

    if (!category) {
      const [newCategory] = await db
        .insert(categories)
        .values({
          name: "Dropshipping",
          slug: "dropshipping",
          description:
            "Automated dropshipping products from the CJ Dropshipping network.",
        })
        .onConflictDoNothing()
        .returning();

      if (!newCategory) {
        category = await db.query.categories.findFirst({
          where: eq(categories.slug, "dropshipping"),
        });
      } else {
        category = newCategory;
      }
    }

    if (!category) {
      throw new Error("Failed to resolve Dropshipping category.");
    }

    // 2. Fetch products from CJ
    console.log("syncCJDropshippingCatalogAction: Calling getProducts...");
    const cjData = await cj.getProducts({ page: 1, size: 10 });
    console.log(
      "syncCJDropshippingCatalogAction: getProducts response:",
      JSON.stringify(cjData, null, 2)
    );

    const cjProductsList =
      (Array.isArray(cjData.data?.content) ? cjData.data.content : null) ||
      (Array.isArray(cjData.result?.content) ? cjData.result.content : null) ||
      (Array.isArray(cjData.data) ? cjData.data : null) ||
      (Array.isArray(cjData.result) ? cjData.result : null) ||
      cjData.data?.content?.[0]?.productList ||
      cjData.result?.content?.[0]?.productList ||
      cjData.data?.list ||
      cjData.result?.list ||
      [];

    console.log(
      "syncCJDropshippingCatalogAction: cjProductsList length:",
      cjProductsList.length
    );

    let updatedCount = 0;
    let createdCount = 0;
    let linkedCount = 0;

    for (const p of cjProductsList) {
      const supplierProductId = p.productId || p.id;
      if (!supplierProductId) continue;

      // Check if product already exists — fetch with variants so we preserve markups
      const existingProduct = await db.query.products.findFirst({
        where: eq(products.supplierProductId, supplierProductId),
        with: { variants: true },
      });

      // Preserve admin-set markup percentages on re-sync
      const productMarkup = existingProduct?.markupPercentage ?? 0;

      let productId: string;
      const productName =
        p.nameEn || p.productName || p.name || "CJ Dropshipping Product";

      const cleanSlug = `${productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")}-${supplierProductId.slice(-4)}`;

      // Collect product images
      const mainImage = p.bigImage || p.productImage || p.image;
      let imageUrls: string[] = mainImage ? [mainImage] : [];

      if (p.productImageList && Array.isArray(p.productImageList)) {
        imageUrls = imageUrls.concat(p.productImageList);
      }
      if (p.imageList && Array.isArray(p.imageList)) {
        imageUrls = imageUrls.concat(p.imageList);
      }
      if (p.images && Array.isArray(p.images)) {
        imageUrls = imageUrls.concat(p.images);
      }
      if (p.multiImage && Array.isArray(p.multiImage)) {
        imageUrls = imageUrls.concat(p.multiImage);
      }
      imageUrls = [...new Set(imageUrls)];

      if (existingProduct) {
        // Preserve name/description if CJ sends nothing useful
        await db
          .update(products)
          .set({
            name: productName,
            slug: cleanSlug,
            description:
              p.description ||
              existingProduct.description ||
              "CJ Dropshipping product.",
            images: imageUrls.length > 0 ? imageUrls : existingProduct.images,
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
            name: productName,
            slug: cleanSlug,
            description: p.description || "CJ Dropshipping product.",
            type: "dropship",
            categoryId: category.id,
            images: imageUrls,
            supplierProductId: supplierProductId,
            markupPercentage: 0, // Admin sets this after first sync
          })
          .returning();
        productId = newProduct.id;
        createdCount++;
      }

      // 3. Sync variants
      try {
        const variantData = await cj.getVariants(supplierProductId);
        const variants = variantData.data || variantData.result || [];

        for (const v of variants) {
          const supplierVid = (v.vid || v.id || "").toString();
          if (!supplierVid) continue;

          const existingVariant = await db.query.productVariants.findFirst({
            where: and(
              eq(productVariants.productId, productId),
              eq(productVariants.supplierVariantId, supplierVid)
            ),
          });

          const sku =
            v.variantSku ||
            v.sku ||
            `CJ-${supplierProductId.slice(0, 6)}-${supplierVid}`;

          const costPrice = parseFloat(
            v.variantSellPrice || v.sellPrice || v.price || "9.99"
          );

          const variantName =
            v.variantKey ||
            v.variantNameEn ||
            v.variantName ||
            "Default Variant";

          const variantImage = v.variantImage || v.image || v.bigImage || null;

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
                name: variantName,
                sku: sku,
                price: finalPrice,
                costPrice: costPrice.toFixed(2),
                inventory: typeof v.stock === "number" ? v.stock : 999,
                imageUrl: variantImage,
                // markupPercentage is intentionally NOT overwritten — admin controls it
              })
              .where(eq(productVariants.id, existingVariant.id));
          } else {
            // New variant — inherit product-level markup as default
            const finalPrice = applyMarkup(costPrice, 0, productMarkup);

            await db.insert(productVariants).values({
              productId: productId,
              name: variantName,
              sku: sku,
              price: finalPrice,
              costPrice: costPrice.toFixed(2),
              markupPercentage: 0, // 0 = use product-level markup
              supplierVariantId: supplierVid,
              inventory: typeof v.stock === "number" ? v.stock : 999,
              imageUrl: variantImage,
            });
          }
        }
      } catch (variantErr) {
        console.error(
          `Failed to sync variants for CJ product ${supplierProductId}:`,
          variantErr
        );
      }

      // 4. Register product with CJ shop
      const syncedProduct = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: { variants: true },
      });

      if (syncedProduct) {
        const linkableVariants = syncedProduct.variants
          .filter((v) => v.supplierVariantId)
          .map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            supplierVariantId: v.supplierVariantId!,
          }));

        if (linkableVariants.length > 0) {
          const linkResult = await linkProductToCJShopSafe(
            cj,
            shopId,
            {
              id: syncedProduct.id,
              name: syncedProduct.name,
              description: syncedProduct.description,
              images: syncedProduct.images,
            },
            supplierProductId,
            linkableVariants
          );
          if (linkResult.linked) linkedCount++;
        }
      }
    }

    revalidatePath("/dashboard/admin/products");
    const shopNote = shopId
      ? `${linkedCount} products linked to CJ store.`
      : "No CJ shop ID found — reconnect your API store in CJ Authorization, then sync again.";
    return {
      success: true,
      message: `CJ Sync complete: ${createdCount} created, ${updatedCount} updated. ${shopNote}`,
    };
  } catch (error: any) {
    console.error("CJ Dropshipping Sync Error:", error);
    return { success: false, error: error.message };
  }
}
