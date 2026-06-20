import { db } from "@/lib/db";
import { orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as any;
    
    // Support multiple typical field structures from CJ's webhooks
    const cjOrderNumber = payload.cjOrderNumber || payload.cjOrderNo || payload.orderNumber || payload.data?.cjOrderNumber;
    const trackingNumber = payload.trackingNumber || payload.trackingNo || payload.data?.trackingNumber;
    const status = payload.status || payload.data?.status || "shipped";

    if (!cjOrderNumber) {
      return NextResponse.json({ success: false, error: "Missing order identifier (cjOrderNumber)." }, { status: 400 });
    }

    if (trackingNumber) {
      await db.update(orderItems)
        .set({
          trackingNumber: trackingNumber,
          fulfillmentStatus: status === "delivered" ? "delivered" : "shipped"
        })
        .where(eq(orderItems.supplierOrderId, cjOrderNumber));

      console.log(`CJ Dropshipping Webhook: Updated tracking for CJ Order ${cjOrderNumber} -> ${trackingNumber}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("CJ Dropshipping Webhook processing error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
