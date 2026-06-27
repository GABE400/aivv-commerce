import { db } from "@/lib/db";
import { orders, users, supplierApplications, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/dodo";
import { routeAutoFulfillmentAction } from "@/lib/actions/fulfillment";

export async function POST(req: Request) {
  const payload = await req.text();
  const headersObj = {
    "webhook-id": req.headers.get("webhook-id") || "",
    "webhook-signature": req.headers.get("webhook-signature") || req.headers.get("x-dodo-signature") || "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
  };

  // 1. Verify Webhook Signature
  const isValid = await paymentProvider.verifyWebhook(payload, headersObj);
  if (!isValid) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    const event = JSON.parse(payload);
    
    // 2. Handle 'payment.succeeded' or 'checkout.succeeded'
    if (event.type === "payment.succeeded" || event.type === "checkout.succeeded") {
      const paymentData = event.data;
      const orderId = paymentData.metadata?.orderId;
      const customer = paymentData.customer;

      if (orderId && paymentData.metadata?.type === "subscription_upgrade") {
        await db.transaction(async (tx) => {
          // 1. Insert approved supplier application
          await tx.insert(supplierApplications).values({
            userId: paymentData.metadata.userId,
            storeName: paymentData.metadata.storeName,
            website: paymentData.metadata.website || null,
            description: `${paymentData.metadata.description} (Paid Plan: ${paymentData.metadata.plan?.toUpperCase()})`,
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

          // 4. Activate the subscription
          await tx.update(subscriptions)
            .set({
              status: "active",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date()
            })
            .where(eq(subscriptions.userId, paymentData.metadata.userId));
        });

        console.log(`Subscription order ${orderId} successfully processed. User ${paymentData.metadata.userId} upgraded to ${paymentData.metadata.plan}.`);
        return NextResponse.json({ received: true });
      }

      if (orderId) {
        // Resolve address details from shipping_address or billing fields
        const addr = paymentData.shipping_address || paymentData.billing;
        let parsedAddress = null;
        if (addr) {
          parsedAddress = JSON.stringify({
            firstName: customer?.name?.split(' ')[0] || "Guest",
            lastName: customer?.name?.split(' ').slice(1).join(' ') || "User",
            email: customer?.email,
            line1: addr.line1 || addr.street || "123 Main St",
            line2: addr.line2 || "",
            city: addr.city || "New York",
            state: addr.state || addr.region || "NY",
            postalCode: addr.postal_code || addr.zipcode || "10001",
            country: addr.country || "US",
            phone: customer?.phone || customer?.phone_number || "",
          });
        }

        // 1. Update order status and store shipping address (if successfully parsed)
        const updateValues: any = {
          paymentStatus: "paid",
          status: "processing",
          updatedAt: new Date(),
        };

        if (parsedAddress) {
          updateValues.shippingAddress = parsedAddress;
        }

        await db.update(orders)
          .set(updateValues)
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
