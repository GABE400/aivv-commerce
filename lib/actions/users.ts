"use server";

import { db } from "@/lib/db";
import { users, supplierApplications, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { paymentProvider } from "@/lib/payments/dodo";

export async function acceptTermsAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.update(users)
      .set({ 
        tosAccepted: true,
        privacyPolicyAccepted: true,
      })
      .where(eq(users.id, session.user.id));
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUpgradeCheckoutAction(data: {
  storeName: string;
  website?: string;
  description?: string;
  plan: "starter" | "growth" | "agency";
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in first." };
  }

  const prices = {
    starter: 29.00,
    growth: 79.00,
    agency: 199.00,
  };

  const planPrice = prices[data.plan];
  if (!planPrice) {
    return { success: false, error: "Invalid subscription plan selected." };
  }

  try {
    // 1. Admin bypass: if user has role 'admin', upgrade immediately and skip payment
    if (session.user.role === "admin") {
      await db.transaction(async (tx) => {
        // Upgrade role to supplier
        await tx.update(users)
          .set({ role: "supplier" })
          .where(eq(users.id, session.user.id));

        // Insert approved supplier application
        await tx.insert(supplierApplications).values({
          userId: session.user.id,
          storeName: data.storeName,
          website: data.website || null,
          description: `${data.description} (Admin Free Access Upgrade)`,
          status: "approved",
        });
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/customer");
      revalidatePath("/dashboard/supplier");

      return { success: true, bypassPayment: true };
    }

    // 2. Shopper flow: Create pending order for checkout tracking
    const [newOrder] = await db.insert(orders).values({
      userId: session.user.id,
      totalAmount: planPrice.toString(),
      status: "pending",
      paymentStatus: "unpaid",
    }).returning();

    // 3. Trigger Dodo Payments checkout session
    const checkout = await paymentProvider.createCheckoutSession({
      orderId: newOrder.id,
      customer: {
        email: session.user.email,
        name: session.user.name,
      },
      items: [
        {
          name: `Aivv Business AI Subscription (${data.plan.toUpperCase()})`,
          price: planPrice,
          quantity: 1,
        }
      ],
      metadata: {
        type: "subscription_upgrade",
        userId: session.user.id,
        plan: data.plan,
        storeName: data.storeName,
        website: data.website || "",
        description: data.description || "",
      }
    });

    // 4. Update order with dodo checkout ID
    await db.update(orders)
      .set({ dodoCheckoutId: checkout.id })
      .where(eq(orders.id, newOrder.id));

    return { success: true, url: checkout.url };
  } catch (error: any) {
    console.error("Create Upgrade Checkout Error:", error);
    return { success: false, error: error.message };
  }
}
