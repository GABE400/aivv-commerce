import { db } from "@/lib/db";
import { orders, orderItems, productVariants, products } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { printifySupplier } from "../suppliers/printify";
import { digitalSupplier } from "../suppliers/imagekit";
import { CJAdapter } from "../suppliers/cj";

export async function processFulfillment(orderId: string) {
  // 1. Fetch order and items with variant/product info
  const orderData = await db.query.orders.findFirst({
    where: eq(orders.id, orderId as any),
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: true
            }
          }
        }
      },
      user: true
    }
  });

  if (!orderData) throw new Error("Order not found");

  // 2. Group items by supplier type
  const podItems = orderData.items.filter(item => item.variant.product.type === "pod");
  const digitalItems = orderData.items.filter(item => item.variant.product.type === "digital");
  const dropshipItems = orderData.items.filter(item => item.variant.product.type === "dropship");

  // 3. Trigger POD fulfillment (Printify)
  if (podItems.length > 0) {
    const { supplierOrderId } = await printifySupplier.createOrder({
      orderId: orderData.id,
      customer: {
        name: orderData.user.name,
        email: orderData.user.email,
        address: orderData.shippingAddress || "",
      },
      items: podItems.map(item => ({
        sku: item.variant.sku,
        quantity: item.quantity,
        supplierVariantId: item.variant.supplierVariantId || undefined,
      }))
    });

    await db.update(orderItems)
      .set({ 
        supplierOrderId, 
        fulfillmentStatus: "in_progress" 
      })
      .where(inArray(orderItems.id, podItems.map(i => i.id)));
  }

  // 4. Trigger Digital fulfillment (Instant)
  if (digitalItems.length > 0) {
    // Generate secure URLs or send emails
    // For now, mark as fulfilled immediately
    await db.update(orderItems)
      .set({ 
        fulfillmentStatus: "delivered",
        supplierOrderId: `IMK_${orderData.id}` 
      })
      .where(inArray(orderItems.id, digitalItems.map(i => i.id)));
    
    // TODO: Send email with download links via Postmark/Resend
  }

  // 5. Trigger Dropship fulfillment (CJ Dropshipping)
  if (dropshipItems.length > 0) {
    const cjSupplier = new CJAdapter(orderData.userId);
    const { supplierOrderId } = await cjSupplier.createOrder({
      orderId: orderData.id,
      customer: {
        name: orderData.user.name,
        email: orderData.user.email,
        address: orderData.shippingAddress || "",
      },
      items: dropshipItems.map(item => ({
        sku: item.variant.sku,
        quantity: item.quantity,
        supplierVariantId: item.variant.supplierVariantId || undefined,
      }))
    });

    await db.update(orderItems)
      .set({ 
        supplierOrderId, 
        fulfillmentStatus: "in_progress" 
      })
      .where(inArray(orderItems.id, dropshipItems.map(i => i.id)));
  }

  // 6. Update overall order status if necessary
  await db.update(orders)
    .set({ status: "processing" })
    .where(eq(orders.id, orderId as any));

  return { success: true };
}
