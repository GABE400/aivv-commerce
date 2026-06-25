"use server";

import { db } from "@/lib/db";
import { products, productVariants, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCJClientForUser } from "@/lib/suppliers/cj-helper";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function syncCJDropshippingCatalogAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || (session.user.role !== "business" && session.user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get CJ client for the current user
    const cj = await getCJClientForUser(session.user.id);
    // 1. Ensure "Dropshipping" category exists
    let category = await db.query.categories.findFirst({
      where: eq(categories.slug, "dropshipping"),
    });

    if (!category) {
      const [newCategory] = await db.insert(categories).values({
        name: "Dropshipping",
        slug: "dropshipping",
        description: "Automated dropshipping products from the CJ Dropshipping network.",
      }).onConflictDoNothing().returning();

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
    const cjData = await cj.getProducts({ page: 1, size: 10 });
    const cjProductsList = 
      (Array.isArray(cjData.data?.content) ? cjData.data.content : null) ||
      (Array.isArray(cjData.result?.content) ? cjData.result.content : null) ||
      cjData.data?.content?.[0]?.productList || 
      cjData.result?.content?.[0]?.productList || 
      cjData.data?.list || 
      cjData.result?.list || 
      [];

    let updatedCount = 0;
    let createdCount = 0;

    for (const p of cjProductsList) {
      const supplierProductId = p.productId || p.id;
      if (!supplierProductId) continue;

      // Check if product already exists
      const existingProduct = await db.query.products.findFirst({
        where: eq(products.supplierProductId, supplierProductId),
      });

      let productId: string;
      const productName = p.nameEn || p.productName || p.name || "CJ Dropshipping Product";
      
      const cleanSlug = `${productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")}-${supplierProductId.slice(-4)}`;

      const imageUrl = p.bigImage || p.productImage || p.image;
      const imageUrls = imageUrl ? [imageUrl] : [];

      if (existingProduct) {
        await db.update(products)
          .set({
            name: productName,
            slug: cleanSlug,
            description: p.description || existingProduct.description || "CJ Dropshipping product.",
            images: imageUrls,
            updatedAt: new Date(),
          })
          .where(eq(products.id, existingProduct.id));
        productId = existingProduct.id;
        updatedCount++;
      } else {
        const [newProduct] = await db.insert(products).values({
          name: productName,
          slug: cleanSlug,
          description: p.description || "CJ Dropshipping product.",
          type: "dropship",
          categoryId: category.id,
          images: imageUrls,
          supplierProductId: supplierProductId,
        }).returning();
        productId = newProduct.id;
        createdCount++;
      }

      // 3. Fetch variants for this product
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

          const sku = v.variantSku || v.sku || `CJ-${supplierProductId.slice(0, 6)}-${supplierVid}`;
          const basePrice = parseFloat(v.variantSellPrice || v.sellPrice || v.price || 9.99);
          const variantName = v.variantKey || v.variantNameEn || v.variantName || "Default Variant";

          // Get product markup percentage
          const productMarkup = existingProduct?.markupPercentage || 0;
          const markedUpPrice = basePrice * (1 + productMarkup / 100);
          const finalPrice = markedUpPrice.toFixed(2);

          if (existingVariant) {
            await db.update(productVariants)
              .set({
                name: variantName,
                sku: sku,
                price: finalPrice,
                inventory: typeof v.stock === "number" ? v.stock : 999,
              })
              .where(eq(productVariants.id, existingVariant.id));
          } else {
            await db.insert(productVariants).values({
              productId: productId,
              name: variantName,
              sku: sku,
              price: finalPrice,
              supplierVariantId: supplierVid,
              inventory: typeof v.stock === "number" ? v.stock : 999,
            });
          }
        }
      } catch (variantErr) {
        console.error(`Failed to sync variants for CJ product ${supplierProductId}:`, variantErr);
      }
    }

    revalidatePath("/dashboard/admin/products");
    return {
      success: true,
      message: `CJ Sync complete: ${createdCount} products created, ${updatedCount} products updated.`,
    };
  } catch (error: any) {
    console.error("CJ Dropshipping Sync Error:", error);
    return { success: false, error: error.message };
  }
}
