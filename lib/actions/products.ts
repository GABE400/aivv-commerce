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

/**
 * Compute sell price: variant-level markup takes priority over product-level.
 */
function applyMarkup(
  costPrice: number,
  variantMarkup: number,
  productMarkup: number
): string {
  const markup = variantMarkup > 0 ? variantMarkup : productMarkup;
  return (costPrice * (1 + markup / 100)).toFixed(2);
}

export async function createProductAction(data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
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

    if (data.variants && data.variants.length > 0) {
      const productMarkup = data.markupPercentage || 0;

      await db.insert(productVariants).values(
        data.variants.map((v: any) => {
          const variantMarkup = Number(v.markupPercentage ?? 0);
          // If a costPrice and markupPercentage are provided, compute the sell price
          const costPrice = v.costPrice ? parseFloat(v.costPrice) : null;
          const price =
            costPrice !== null && variantMarkup > 0
              ? applyMarkup(costPrice, variantMarkup, productMarkup)
              : v.price;

          return {
            productId: newProduct.id,
            name: v.name,
            sku: v.sku,
            price,
            costPrice: v.costPrice || null,
            markupPercentage: variantMarkup,
            inventory: v.inventory || 0,
            supplierVariantId: v.supplierVariantId || null,
            assetUrl: v.assetUrl || null,
          };
        })
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
    const productMarkup = data.markupPercentage || 0;

    // 1. Update product
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
        markupPercentage: productMarkup,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    // 2. Fetch current variants
    const currentVariants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, productId),
    });

    // 3. Upsert incoming variants
    const incomingVariantIds = new Set<string>();

    for (const v of data.variants) {
      const variantMarkup = Number(v.markupPercentage ?? 0);
      const costPrice = v.costPrice ? parseFloat(v.costPrice) : null;

      // If admin explicitly set a sell price, use it; if markup changed and costPrice exists, recompute
      const price =
        costPrice !== null && variantMarkup > 0
          ? applyMarkup(costPrice, variantMarkup, productMarkup)
          : v.price;

      let existingVariant = v.id
        ? currentVariants.find((cv) => cv.id === v.id)
        : null;

      if (!existingVariant) {
        existingVariant = currentVariants.find((cv) => cv.sku === v.sku);
      }

      if (existingVariant) {
        await db
          .update(productVariants)
          .set({
            name: v.name,
            sku: v.sku,
            price,
            costPrice: v.costPrice || null,
            markupPercentage: variantMarkup,
            inventory: v.inventory || 0,
            supplierVariantId: v.supplierVariantId || null,
            assetUrl: v.assetUrl || null,
          })
          .where(eq(productVariants.id, existingVariant.id));
        incomingVariantIds.add(existingVariant.id);
      } else {
        await db.insert(productVariants).values({
          productId: productId,
          name: v.name,
          sku: v.sku,
          price,
          costPrice: v.costPrice || null,
          markupPercentage: variantMarkup,
          inventory: v.inventory || 0,
          supplierVariantId: v.supplierVariantId || null,
          assetUrl: v.assetUrl || null,
        });
      }
    }

    // 4. Remove variants no longer in the list (unless they have orders)
    const variantsToCheck = currentVariants.filter(
      (v) => !incomingVariantIds.has(v.id)
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

/**
 * Re-apply markup percentages to all variants of a product without re-syncing
 * from the supplier. Useful after the admin changes markup on a synced product.
 */
export async function applyMarkupToProductAction(productId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { variants: true },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    const productMarkup = product.markupPercentage ?? 0;
    let updatedCount = 0;

    for (const variant of product.variants) {
      const costPrice = variant.costPrice
        ? parseFloat(variant.costPrice)
        : null;
      if (costPrice === null) continue; // Skip variants without a cost price

      const variantMarkup = variant.markupPercentage ?? 0;
      const newPrice = applyMarkup(costPrice, variantMarkup, productMarkup);

      await db
        .update(productVariants)
        .set({ price: newPrice })
        .where(eq(productVariants.id, variant.id));

      updatedCount++;
    }

    revalidatePath("/dashboard/admin/products");
    if (product.slug) revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      message: `Markup applied to ${updatedCount} variant${
        updatedCount !== 1 ? "s" : ""
      }.`,
    };
  } catch (error: any) {
    console.error("Failed to apply markup:", error);
    return {
      success: false,
      error: error.message || "Failed to apply markup",
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
      await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(products.id, productId));

      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
      });
      if (product?.slug) revalidatePath(`/products/${product.slug}`);
      revalidatePath("/dashboard/admin/products");

      return {
        success: true,
        message: "Product marked as inactive (has existing orders)",
      };
    } else {
      await db
        .delete(productVariants)
        .where(eq(productVariants.productId, productId));
      await db.delete(products).where(eq(products.id, productId));
      revalidatePath("/dashboard/admin/products");

      return { success: true, message: "Product permanently deleted" };
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
      .set({ isActive: true, updatedAt: new Date() })
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
      .values({ name: data.name, slug, description: data.description })
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
