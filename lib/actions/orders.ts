"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateOrderStatusAction(orderId: string, status: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    
    revalidatePath("/dashboard/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePaymentStatusAction(orderId: string, paymentStatus: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.update(orders)
      .set({ paymentStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    
    revalidatePath("/dashboard/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
