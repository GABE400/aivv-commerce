"use server";

import { db } from "@/lib/db";
import { products, productVariants, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { printify } from "@/lib/printify";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function syncPrintifyCatalogAction() {
  try {
    // 1. Ensure "Print-on-Demand" category exists (upsert-safe)
    let category = await db.query.categories.findFirst({
        where: eq(categories.slug, "print-on-demand")
    });

    if (!category) {
        const [newCategory] = await db.insert(categories).values({
            name: "Print-on-Demand",
            slug: "print-on-demand",
            description: "Automated dropshipping products from the Printify network."
        }).onConflictDoNothing().returning();

        // If onConflictDoNothing returned nothing, fetch it
        if (!newCategory) {
            category = await db.query.categories.findFirst({
                where: eq(categories.slug, "print-on-demand")
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
        // Check if product already exists
        const existingProduct = await db.query.products.findFirst({
            where: eq(products.supplierProductId, p.id)
        });

        let productId: string;

        if (existingProduct) {
            // Update — ensure slug is clean and URL-safe
            const cleanSlug = `${p.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")}-${p.id.slice(-4)}`;

            await db.update(products)
                .set({
                    name: p.title,
                    slug: cleanSlug,
                    description: p.description,
                    images: p.images.map((img: any) => img.src),
                    updatedAt: new Date(),
                })
                .where(eq(products.id, existingProduct.id));
            productId = existingProduct.id;
            updatedCount++;
        } else {
            // Create — generate a clean slug
            const cleanSlug = `${p.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")}-${p.id.slice(-4)}`;

            const [newProduct] = await db.insert(products).values({
                name: p.title,
                slug: cleanSlug,
                description: p.description,
                type: "pod",
                categoryId: category.id,
                images: p.images.map((img: any) => img.src),
                supplierProductId: p.id,
            }).returning();
            productId = newProduct.id;
            createdCount++;
        }

        // Handle Variants — only process enabled ones
        const enabledVariants = p.variants.filter((v: any) => v.is_enabled);

        for (const v of enabledVariants) {
            const supplierVid = v.id.toString();

            const existingVariant = await db.query.productVariants.findFirst({
                where: and(
                    eq(productVariants.productId, productId),
                    eq(productVariants.supplierVariantId, supplierVid)
                )
            });

            // Generate a unique SKU if Printify doesn't provide one
            const sku = v.sku && v.sku.trim() !== ""
                ? v.sku
                : `PFY-${p.id.slice(0, 6)}-${supplierVid}`;

            if (existingVariant) {
                await db.update(productVariants)
                    .set({
                        name: v.title,
                        sku: sku,
                        price: (v.price / 100).toString(),
                        inventory: 999,
                    })
                    .where(eq(productVariants.id, existingVariant.id));
            } else {
                await db.insert(productVariants).values({
                    productId: productId,
                    name: v.title,
                    sku: sku,
                    price: (v.price / 100).toString(),
                    supplierVariantId: supplierVid,
                    inventory: 999,
                });
            }
        }
    }

    revalidatePath("/dashboard/admin/products");
    return { 
        success: true, 
        message: `Sync complete: ${createdCount} products created, ${updatedCount} products updated.` 
    };
  } catch (error: any) {
    console.error("Printify Sync Error:", error);
    return { success: false, error: error.message };
  }
}
