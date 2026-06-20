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
        type: variant.product.type,
        supplierProductId: variant.product.supplierProductId,
        supplierVariantId: variant.supplierVariantId,
      };
    });

    // Calculate shipping rates
    let shippingFee = 0;
    const podItems = itemsToCreate.filter(i => i.type === "pod" && i.supplierProductId && i.supplierVariantId);
    const dropshipItems = itemsToCreate.filter(i => i.type === "dropship" && i.supplierVariantId);

    if (podItems.length > 0 || dropshipItems.length > 0) {
      // Import clients inside function to prevent circular imports if any
      const { printify } = await import("@/lib/printify");
      const { cj } = await import("@/lib/cjdropshipping");

      // 1. Fetch shipping address (use last order address or default fallback)
      const lastOrder = await db.query.orders.findFirst({
        where: eq(orders.userId, session.user.id),
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      });
      
      let shippingAddress = {
        firstName: session.user.name.split(" ")[0] || "Guest",
        lastName: session.user.name.split(" ").slice(1).join(" ") || "User",
        address1: "123 Main St",
        city: "New York",
        region: "NY",
        zip: "10001",
        country: "US",
      };

      if (lastOrder && lastOrder.shippingAddress) {
        try {
          const parsed = JSON.parse(lastOrder.shippingAddress);
          if (parsed.country) {
            shippingAddress = {
              firstName: parsed.firstName || shippingAddress.firstName,
              lastName: parsed.lastName || shippingAddress.lastName,
              address1: parsed.line1 || parsed.address1 || shippingAddress.address1,
              city: parsed.city || shippingAddress.city,
              region: parsed.state || parsed.region || shippingAddress.region,
              zip: parsed.postalCode || parsed.zip || shippingAddress.zip,
              country: parsed.country || shippingAddress.country,
            };
          }
        } catch (e) {
          console.error("Error parsing last order shipping address:", e);
        }
      }

      // Calculate Printify Shipping
      if (podItems.length > 0) {
        try {
          const printifyShipping = await printify.calculateShippingRates({
            lineItems: podItems.map(item => ({
              productId: item.supplierProductId!,
              variantId: item.supplierVariantId!,
              quantity: item.quantity,
            })),
            shippingAddress,
          });
          shippingFee += printifyShipping;
        } catch (err) {
          console.error("Error calculating Printify shipping fee:", err);
          shippingFee += 5.99; // fallback
        }
      }

      // Calculate CJ Shipping
      if (dropshipItems.length > 0) {
        try {
          const cjShipping = await cj.calculateShippingRates({
            endCountryCode: shippingAddress.country,
            products: dropshipItems.map(item => ({
              vid: item.supplierVariantId!,
              quantity: item.quantity,
            })),
          });
          shippingFee += cjShipping;
        } catch (err) {
          console.error("Error calculating CJ shipping fee:", err);
          shippingFee += 6.99; // fallback
        }
      }
    }

    total += shippingFee;

    // 2. Create Order in DB (Pending)
    const [newOrder] = await db.insert(orders).values({
      userId: session.user.id,
      totalAmount: total.toFixed(2),
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
    const checkoutItems = itemsToCreate.map(item => ({
      name: `${item.name} (${item.variantName})`,
      price: parseFloat(item.price),
      quantity: item.quantity,
      image: item.image,
      productId: process.env.DODO_ECOMMERCE_PRODUCT_ID || process.env.DODO_PRODUCT_ID || "p_mock_123",
    }));

    if (shippingFee > 0) {
      checkoutItems.push({
        name: "Shipping & Fulfillment Fee",
        price: parseFloat(shippingFee.toFixed(2)),
        quantity: 1,
        image: undefined as any,
        productId: process.env.DODO_ECOMMERCE_PRODUCT_ID || process.env.DODO_PRODUCT_ID || "p_mock_123",
      });
    }

    const checkout = await paymentProvider.createCheckoutSession({
      orderId: newOrder.id,
      customer: {
        email: session.user.email,
        name: session.user.name,
      },
      items: checkoutItems,
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
