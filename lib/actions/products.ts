"use server";

import { db } from "@/lib/db";
import {
  products,
  productVariants,
  categories,
  orderItems,
} from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createProductAction(data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    // 1. Create Product
    const [newProduct] = await db
      .insert(products)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        images: data.images,
        markupPercentage: data.markupPercentage || 0,
      })
      .returning();

    // 2. Create Variants
    if (data.variants && data.variants.length > 0) {
      await db.insert(productVariants).values(
        data.variants.map((v: any) => ({
          productId: newProduct.id,
          name: v.name,
          sku: v.sku,
          price: v.price,
          costPrice: v.costPrice || null,
          inventory: v.inventory || 0,
          supplierVariantId: v.supplierVariantId,
          assetUrl: v.assetUrl,
        })),
      );
    }

    revalidatePath("/dashboard/admin/products");
    return { success: true, id: newProduct.id };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return {
      success: false,
      error: error.message || "Failed to create product",
    };
  }
}

export async function updateProductAction(productId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    console.log("Updating product with data:", JSON.stringify(data, null, 2));
    // 1. Update Product
    await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        images: data.images,
        markupPercentage: data.markupPercentage || 0,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    // 2. Fetch current variants
    const currentVariants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, productId),
    });

    // 3. Process incoming variants
    const incomingVariantIds = new Set<string>();

    for (const v of data.variants) {
      // Check if variant exists by ID first
      let existingVariant = v.id
        ? currentVariants.find((cv) => cv.id === v.id)
        : null;

      // If no ID, check by SKU for existing variant in this product
      if (!existingVariant) {
        existingVariant = currentVariants.find((cv) => cv.sku === v.sku);
      }

      if (existingVariant) {
        // Update existing variant
        await db
          .update(productVariants)
          .set({
            name: v.name,
            sku: v.sku,
            price: v.price,
            costPrice: v.costPrice || null,
            inventory: v.inventory || 0,
            supplierVariantId: v.supplierVariantId,
            assetUrl: v.assetUrl,
          })
          .where(eq(productVariants.id, existingVariant.id));
        incomingVariantIds.add(existingVariant.id);
      } else {
        // Insert new variant
        await db.insert(productVariants).values({
          productId: productId,
          name: v.name,
          sku: v.sku,
          price: v.price,
          costPrice: v.costPrice || null,
          inventory: v.inventory || 0,
          supplierVariantId: v.supplierVariantId,
          assetUrl: v.assetUrl,
        });
      }
    }

    // 4. Check which variants to delete (current but not in incoming, and not referenced by any order items)
    const variantsToCheck = currentVariants.filter(
      (v) => !incomingVariantIds.has(v.id),
    );

    for (const variant of variantsToCheck) {
      const hasOrders = await db.query.orderItems.findFirst({
        where: eq(orderItems.variantId, variant.id),
      });

      if (!hasOrders) {
        await db
          .delete(productVariants)
          .where(eq(productVariants.id, variant.id));
      }
    }

    revalidatePath("/dashboard/admin/products");
    revalidatePath(`/products/${data.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
}

export async function deleteProductAction(productId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    // Check if there are any order items for this product
    const variants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, productId),
    });

    const hasOrders =
      variants.length > 0
        ? (await db.query.orderItems.findFirst({
            where:
              variants.length === 1
                ? eq(orderItems.variantId, variants[0].id)
                : or(...variants.map((v) => eq(orderItems.variantId, v.id))),
          })) !== undefined
        : false;

    if (hasOrders) {
      // Soft delete: mark product as inactive to preserve order history
      await db
        .update(products)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      revalidatePath("/dashboard/admin/products");
      return {
        success: true,
        message: "Product marked as inactive (has existing orders)",
      };
    } else {
      // Hard delete: delete variants first, then product
      await db
        .delete(productVariants)
        .where(eq(productVariants.productId, productId));

      await db.delete(products).where(eq(products.id, productId));

      revalidatePath("/dashboard/admin/products");
      return {
        success: true,
        message: "Product permanently deleted",
      };
    }
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product",
    };
  }
}

export async function reactivateProductAction(productId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    await db
      .update(products)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    revalidatePath("/dashboard/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reactivate product:", error);
    return {
      success: false,
      error: error.message || "Failed to reactivate product",
    };
  }
}

export async function createCategoryAction(data: {
  name: string;
  description?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug,
        description: data.description,
      })
      .returning();

    revalidatePath("/dashboard/admin/products");
    return { success: true, category: newCategory };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return {
      success: false,
      error: error.message || "Failed to create category",
    };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    // Check if there are any products using this category
    const productUsingCategory = await db.query.products.findFirst({
      where: eq(products.categoryId, categoryId),
    });

    if (productUsingCategory) {
      return {
        success: false,
        error:
          "Cannot delete category. There are products currently assigned to it.",
      };
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidatePath("/dashboard/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return {
      success: false,
      error: error.message || "Failed to delete category",
    };
  }
}
