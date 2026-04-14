"use server";

import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createProductAction(data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    return await db.transaction(async (tx) => {
      // 1. Create Product
      const [newProduct] = await tx.insert(products).values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        images: data.images, 
      }).returning();

      // 2. Create Variants
      if (data.variants && data.variants.length > 0) {
        await tx.insert(productVariants).values(
          data.variants.map((v: any) => ({
            productId: newProduct.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            inventory: v.inventory || 0,
            supplierVariantId: v.supplierVariantId,
            assetUrl: v.assetUrl,
          }))
        );
      }

      revalidatePath("/dashboard/admin/products");
      return { success: true, id: newProduct.id };
    });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProductAction(productId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    return await db.transaction(async (tx) => {
      // 0. Verify this is a Printify product
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId)
      });

      if (!product || !product.supplierProductId) {
        return { success: false, error: "Customization restricted to Printify products." };
      }

      // 1. Update Product
      await tx.update(products)
        .set({
          name: data.name,
          slug: data.slug,
          description: data.description,
          type: data.type,
          categoryId: data.categoryId,
          supplierId: data.supplierId,
          images: data.images,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      // 2. Delete existing variants and re-insert
      await tx.delete(productVariants).where(eq(productVariants.productId, productId));

      if (data.variants && data.variants.length > 0) {
        await tx.insert(productVariants).values(
          data.variants.map((v: any) => ({
            productId: productId,
            name: v.name,
            sku: v.sku,
            price: v.price,
            inventory: v.inventory || 0,
            supplierVariantId: v.supplierVariantId,
            assetUrl: v.assetUrl,
          }))
        );
      }

      revalidatePath("/dashboard/admin/products");
      revalidatePath(`/products/${data.slug}`);
      return { success: true };
    });
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return { success: false, error: error.message || "Failed to update product" };
  }
}
