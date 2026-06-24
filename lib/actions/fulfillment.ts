"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants } from "@/lib/db/schema";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import { printify } from "@/lib/printify";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function routeAutoFulfillmentAction(orderId: string) {
  try {
    // 1. Fetch Order and its items with type and supplier identifiers
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        user: true,
        items: {
          with: {
            variant: {
              with: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!orderData || !orderData.shippingAddress) {
      console.warn(`Fulfillment Router: Order ${orderId} not found or missing shipping address.`);
      return;
    }

    // Parse shipping address (assuming JSON string from Dodo)
    let address;
    try {
      address = JSON.parse(orderData.shippingAddress);
    } catch (e) {
      console.error(`Fulfillment Router: Failed to parse address for order ${orderId}`, e);
      return;
    }

    // 2. Identify POD items
    const podItems = orderData.items.filter(
      item => item.variant.product.type === "pod" && item.variant.supplierVariantId
    );

    // Identify Dropship items
    const dropshipItems = orderData.items.filter(
      item => item.variant.product.type === "dropship" && item.variant.supplierVariantId
    );

    if (podItems.length === 0 && dropshipItems.length === 0) {
      console.log(`Fulfillment Router: No POD or Dropship items found in order ${orderId}.`);
      return;
    }

    // 3. Group by Product for Printify
    if (podItems.length > 0) {
      try {
        const printifyResult = await printify.createOrder({
          externalId: orderData.id,
          lineItems: podItems.map(item => ({
            productId: item.variant.product.supplierProductId || "",
            variantId: item.variant.supplierVariantId!,
            quantity: item.quantity,
          })),
          shippingAddress: {
            firstName: address.firstName || orderData.user.name.split(' ')[0],
            lastName: address.lastName || orderData.user.name.split(' ').slice(1).join(' ') || "User",
            email: orderData.user.email,
            phone: address.phone || "",
            address1: address.line1,
            address2: address.line2,
            city: address.city,
            region: address.state,
            zip: address.postalCode,
            country: address.country,
          }
        });

        // 4. Update order items with Printify ID
        if (printifyResult && printifyResult.id) {
          for (const item of podItems) {
              await db.update(orderItems)
                  .set({ 
                      supplierOrderId: printifyResult.id,
                      fulfillmentStatus: "pending" 
                  })
                  .where(eq(orderItems.id, item.id));
          }
          console.log(`Fulfillment Router: Order ${orderId} successfully pushed to Printify ID ${printifyResult.id}`);
        }
      } catch (error: any) {
        console.error(`Fulfillment Router: Printify submission failed for order ${orderId}`, error);
        for (const item of podItems) {
            await db.update(orderItems)
                .set({ fulfillmentStatus: "none" }) // Reset or mark as failed
                .where(eq(orderItems.id, item.id));
        }
      }
    }

    // 4. Group items for CJ Dropshipping
    if (dropshipItems.length > 0) {
      try {
        const { cj } = await import("@/lib/cjdropshipping");
        const cjResult = await cj.createOrder({
          orderNumber: orderData.id,
          shippingCustomerName: `${address.firstName || orderData.user.name.split(' ')[0]} ${address.lastName || orderData.user.name.split(' ').slice(1).join(' ') || "User"}`.trim(),
          shippingAddress: address.line1,
          shippingAddress2: address.line2 || "",
          shippingCity: address.city,
          shippingProvince: address.state,
          shippingCountry: address.countryName || address.country || "United States",
          shippingCountryCode: address.country || "US",
          shippingZip: address.postalCode,
          shippingPhone: address.phone || "",
          products: dropshipItems.map(item => ({
            vid: item.variant.supplierVariantId!,
            quantity: item.quantity,
            storeLineItemId: item.id,
          })),
        });

        const cjOrderNumber = cjResult?.data?.cjOrderNumber || cjResult?.result?.cjOrderNumber;

        if (cjOrderNumber) {
          for (const item of dropshipItems) {
            await db.update(orderItems)
              .set({
                supplierOrderId: cjOrderNumber,
                fulfillmentStatus: "in_progress",
              })
              .where(eq(orderItems.id, item.id));
          }
          console.log(`Fulfillment Router: Order ${orderId} successfully pushed to CJ Dropshipping with ID ${cjOrderNumber}`);
        }
      } catch (error: any) {
        console.error(`Fulfillment Router: CJ Dropshipping submission failed for order ${orderId}`, error);
        for (const item of dropshipItems) {
            await db.update(orderItems)
                .set({ fulfillmentStatus: "none" })
                .where(eq(orderItems.id, item.id));
        }
      }
    }

    // Update overall order status if any of items are now fulfilled or processing
    await db.update(orders)
      .set({ status: "processing" })
      .where(eq(orders.id, orderId));

  } catch (error) {
    console.error(`Fulfillment Router: Unexpected error routing order ${orderId}`, error);
  }
}

export async function manualFulfillOrderAction(orderId: string) {
  try {
    await routeAutoFulfillmentAction(orderId);
    return { success: true, message: "Fulfillment routing completed." };
  } catch (error: any) {
    console.error("Manual Fulfillment Action Error:", error);
    return { success: false, error: error.message || "Manual fulfillment failed." };
  }
}

export async function getSupplierPaymentsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const items = await db.query.orderItems.findMany({
    with: {
      order: {
        with: {
          user: true,
        },
      },
      variant: {
        with: {
          product: true,
        },
      },
    },
    where: isNotNull(orderItems.supplierOrderId),
    orderBy: [desc(orderItems.orderId)],
    limit: 50,
  });

  return items;
}

export async function getRealtimeSupplierStatusAction(supplierType: string, supplierOrderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    if (supplierType === "pod") {
      const { printify } = await import("@/lib/printify");
      const order = await printify.getOrder(supplierOrderId);
      const statusText = order.status || "Unknown";
      const isPaid = statusText === "payment_received" || statusText === "processing" || statusText === "fulfilled" || statusText === "shipment_delivered";
      return {
        success: true,
        status: statusText,
        isPaid,
      };
    } else if (supplierType === "dropship") {
      const { cj } = await import("@/lib/cjdropshipping");
      const res = await cj.getOrder(supplierOrderId);
      const order = res.data || {};
      const statusText = order.status || "Unknown";
      const isPaid = statusText !== "Awaiting Payment" && statusText !== "1" && statusText !== "unpaid";
      return {
        success: true,
        status: statusText,
        isPaid,
      };
    }
    return { success: false, error: "Invalid supplier type" };
  } catch (err: any) {
    console.error("Realtime supplier status error:", err);
    return { success: false, error: err.message || "Failed to fetch realtime status" };
  }
}

