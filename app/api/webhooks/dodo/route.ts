import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
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
