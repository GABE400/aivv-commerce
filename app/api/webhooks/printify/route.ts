import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.text();
  // Note: In production, verify the Printify signature if available
  // or use a secret token in the URL params for safety.

  try {
    const event = JSON.parse(payload);
    
    // Handle 'order:shipped'
    if (event.type === "order:shipped") {
      const { id: printifyOrderId, shipments } = event.data;
      
      if (shipments && shipments.length > 0) {
        const shipment = shipments[0];
        const trackingNumber = shipment.tracking_number;
        const carrier = shipment.carrier;

        // Update all order items associated with this Printify ID
        await db.update(orderItems)
          .set({ 
            fulfillmentStatus: "shipped",
            trackingNumber: trackingNumber,
            updatedAt: new Date()
          })
          .where(eq(orderItems.supplierOrderId, printifyOrderId));

        console.log(`Printify Webhook: Order ${printifyOrderId} marked as SHIPPED with tracking ${trackingNumber}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Printify Webhook Error:", error);
    return new NextResponse("Webhook processing error", { status: 500 });
  }
}
