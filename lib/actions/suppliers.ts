"use server";

import { db } from "@/lib/db";
import { orderItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateFulfillmentAction(itemId: string, data: { trackingNumber?: string, status: any }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || (session.user.role !== "supplier" && session.user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // In a real multi-tenant app, we'd also verify the supplier owns the product for this item
    // For now, we perform the update directly
    await db.update(orderItems)
      .set({ 
        fulfillmentStatus: data.status,
        trackingNumber: data.trackingNumber,
      })
      .where(eq(orderItems.id, itemId));
    
    revalidatePath("/dashboard/supplier");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
