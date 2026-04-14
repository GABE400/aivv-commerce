"use server";

import { db } from "@/lib/db";
import { orders, orderItems, productVariants } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { inArray, eq } from "drizzle-orm";
import { paymentProvider } from "@/lib/payments/dodo";

export async function createCheckoutAction(items: { variantId: string, quantity: number }[]) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Please sign in to complete your purchase." };
  }

  try {
    const variantIds = items.map(i => i.variantId);
    
    // 1. Fetch real prices from DB to prevent client-side manipulation
    const dbVariants = await db.query.productVariants.findMany({
      where: inArray(productVariants.id, variantIds),
      with: {
        product: true
      }
    });

    if (dbVariants.length === 0) {
      throw new Error("No valid products found in cart.");
    }

    // Calculate total
    let total = 0;
    const itemsToCreate = items.map(cartItem => {
      const variant = dbVariants.find(v => v.id === cartItem.variantId);
      if (!variant) throw new Error(`Variant ${cartItem.variantId} not found.`);
      
      const price = parseFloat(variant.price);
      total += price * cartItem.quantity;
      
      return {
        variantId: variant.id,
        quantity: cartItem.quantity,
        price: price.toString(),
        name: variant.product.name,
        variantName: variant.name,
        image: variant.product.images[0],
      };
    });

    // 2. Create Order in DB (Pending)
    const [newOrder] = await db.insert(orders).values({
      userId: session.user.id,
      totalAmount: total.toString(),
      status: "pending",
      paymentStatus: "unpaid",
    }).returning();

    // 3. Create Order Items
    await db.insert(orderItems).values(
      itemsToCreate.map(item => ({
        orderId: newOrder.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    // 4. Trigger Dodo Payments
    const checkout = await paymentProvider.createCheckoutSession({
      orderId: newOrder.id,
      customer: {
        email: session.user.email,
        name: session.user.name,
      },
      items: itemsToCreate.map(item => ({
        name: `${item.name} (${item.variantName})`,
        price: parseFloat(item.price),
        quantity: item.quantity,
        image: item.image,
      })),
      metadata: {
        userId: session.user.id
      }
    });

    // 5. Update order with dodo checkout ID
    await db.update(orders)
      .set({ dodoCheckoutId: checkout.id })
      .where(eq(orders.id, newOrder.id));

    return { success: true, url: checkout.url };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: error.message };
  }
}
