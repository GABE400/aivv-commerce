import { db } from "@/lib/db";
import { orders, users, supplierApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/dodo";
import { routeAutoFulfillmentAction } from "@/lib/actions/fulfillment";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-dodo-signature") || "";

  // 1. Verify Webhook Signature
  const isValid = await paymentProvider.verifyWebhook(payload, signature);
  if (!isValid) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    const event = JSON.parse(payload);
    
    // 2. Handle 'order.paid' or 'checkout.completed'
    // Note: Adjust based on Dodo's actual event schema
    if (event.type === "checkout.succeeded") {
      const { checkout_id, metadata, customer, shipping_address } = event.data;
      const orderId = metadata?.orderId;

      if (orderId && metadata?.type === "subscription_upgrade") {
        await db.transaction(async (tx) => {
          // 1. Upgrade user's role to supplier
          await tx.update(users)
            .set({ role: "supplier" })
            .where(eq(users.id, metadata.userId));

          // 2. Insert approved supplier application
          await tx.insert(supplierApplications).values({
            userId: metadata.userId,
            storeName: metadata.storeName,
            website: metadata.website || null,
            description: `${metadata.description} (Paid Plan: ${metadata.plan?.toUpperCase()})`,
            status: "approved",
          });

          // 3. Mark subscription order as paid/fulfilled
          await tx.update(orders)
            .set({ 
              paymentStatus: "paid",
              status: "fulfilled",
              updatedAt: new Date()
            })
            .where(eq(orders.id, orderId));
        });

        console.log(`Subscription order ${orderId} successfully processed. User ${metadata.userId} upgraded to ${metadata.plan}.`);
        return NextResponse.json({ received: true });
      }

      if (orderId) {
        // 1. Update order status and store shipping address
        await db.update(orders)
          .set({ 
            paymentStatus: "paid",
            status: "processing", 
            shippingAddress: shipping_address ? JSON.stringify({
              firstName: customer?.name?.split(' ')[0] || "Guest",
              lastName: customer?.name?.split(' ').slice(1).join(' ') || "User",
              email: customer?.email,
              line1: shipping_address.line1,
              line2: shipping_address.line2,
              city: shipping_address.city,
              state: shipping_address.state,
              postalCode: shipping_address.postal_code,
              country: shipping_address.country,
              phone: customer?.phone || "",
            }) : null,
            updatedAt: new Date()
          })
          .where(eq(orders.id, orderId));
          
        console.log(`Order ${orderId} marked as PAID. Initializing fulfillment router...`);

        // 2. Trigger Fulfillment Router (Background)
        // We don't await this to respond to Dodo quickly
        routeAutoFulfillmentAction(orderId).catch(err => {
            console.error(`Fulfillment Router Error for order ${orderId}:`, err);
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Processing Error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
