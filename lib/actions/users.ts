"use server";

import { db } from "@/lib/db";
import { users, supplierApplications, orders, orderItems, subscriptions, aiApiKeys, userWorkflows, workflowTemplates, workflowExecutions, sessions, accounts, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { paymentProvider } from "@/lib/payments/dodo";
import { encrypt } from "@/lib/encryption";

function getProviderFromModel(model: string) {
  if (model.includes("openrouter") || model.startsWith("openrouter/")) return "openrouter";
  if (model.includes("claude")) return "anthropic";
  if (model.includes("gpt")) return "openai";
  if (model.includes("llama")) return "groq";
  if (model.includes("deepseek")) return "deepseek";
  if (model.includes("gemini")) return "gemini";
  return "unknown";
}

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
  plan: "free" | "starter" | "growth" | "agency";
  apiKeys: {
    anthropic?: string;
    openai?: string;
    groq?: string;
    deepseek?: string;
    gemini?: string;
    openrouter?: string;
  };
  workflows: {
    summarizerModel: string;
    emailModel: string;
    invoiceModel: string;
  };
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in first." };
  }

  const prices = {
    free: 0.00,
    starter: 29.00,
    growth: 79.00,
    agency: 199.00,
  };

  const planPrice = prices[data.plan];
  if (planPrice === undefined) {
    return { success: false, error: "Invalid subscription plan selected." };
  }

  try {
    // Shared: Setup API Keys & Workflows
    // Note: neon-http driver does not support db.transaction(), so we run sequential inserts.

    // 1. Insert API Keys
    const keysToInsert = [];
    const providers = ["anthropic", "openai", "groq", "deepseek", "gemini", "openrouter"] as const;
    for (const provider of providers) {
      const key = data.apiKeys[provider];
      if (key) {
        const { encrypted, iv } = encrypt(key);
        keysToInsert.push({ userId: session.user.id, provider, encryptedKey: encrypted, iv });
      }
    }
    if (keysToInsert.length > 0) {
      await db.insert(aiApiKeys).values(keysToInsert);
    }

    // 2. Fetch templates
    const templates = await db.select().from(workflowTemplates);
    const tMap = templates.reduce((acc, t) => {
      acc[t.slug] = t.id;
      return acc;
    }, {} as Record<string, string>);

    // 3. Insert Workflows
    const workflowsToInsert = [];
    if (data.workflows.summarizerModel !== "none" && tMap["document-summarizer"]) {
      workflowsToInsert.push({
        userId: session.user.id,
        templateId: tMap["document-summarizer"],
        provider: getProviderFromModel(data.workflows.summarizerModel),
        model: data.workflows.summarizerModel,
      });
    }
    if (data.workflows.emailModel !== "none" && tMap["email-responder"]) {
      workflowsToInsert.push({
        userId: session.user.id,
        templateId: tMap["email-responder"],
        provider: getProviderFromModel(data.workflows.emailModel),
        model: data.workflows.emailModel,
      });
    }
    if (data.workflows.invoiceModel !== "none" && tMap["invoice-assistant"]) {
      workflowsToInsert.push({
        userId: session.user.id,
        templateId: tMap["invoice-assistant"],
        provider: getProviderFromModel(data.workflows.invoiceModel),
        model: data.workflows.invoiceModel,
      });
    }
    if (workflowsToInsert.length > 0) {
      await db.insert(userWorkflows).values(workflowsToInsert);
    }

    // 4. Admin or Free plan bypass: if user has role 'admin' or selected 'free' plan, upgrade immediately and skip payment
    if (session.user.role === "admin" || data.plan === "free") {

      await db.insert(supplierApplications).values({
        userId: session.user.id,
        storeName: data.storeName,
        website: data.website || null,
        description: `${data.description} (${data.plan === "free" ? "Free Business Plan" : "Admin Free Access Upgrade"})`,
        status: "approved",
      });

      await db.insert(subscriptions).values({
        userId: session.user.id,
        plan: data.plan,
        status: "active", // Immediate active for admin or free plan
      });
    } else {
      // Create pending subscription for shopper flow
      await db.insert(subscriptions).values({
        userId: session.user.id,
        plan: data.plan,
        status: "trialing", // Pending payment
      });
    }

    if (session.user.role === "admin" || data.plan === "free") {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/customer");
      revalidatePath("/dashboard/supplier");
      return { success: true, bypassPayment: true };
    }

    // 5. Shopper flow: Create pending order for checkout tracking
    const [newOrder] = await db.insert(orders).values({
      userId: session.user.id,
      totalAmount: planPrice.toString(),
      status: "pending",
      paymentStatus: "unpaid",
    }).returning();

    const planProductIds = {
      free: "p_mock_free",
      starter: process.env.DODO_STARTER_PRODUCT_ID || process.env.DODO_PRODUCT_ID || "p_mock_123",
      growth: process.env.DODO_GROWTH_PRODUCT_ID || process.env.DODO_PRODUCT_ID || "p_mock_123",
      agency: process.env.DODO_AGENCY_PRODUCT_ID || process.env.DODO_PRODUCT_ID || "p_mock_123",
    };

    // 6. Trigger Dodo Payments checkout session
    const checkout = await paymentProvider.createCheckoutSession({
      orderId: newOrder.id,
      customer: {
        email: session.user.email,
        name: session.user.name || "Customer",
      },
      items: [
        {
          name: `${data.plan.toUpperCase()} Plan Subscription`,
          price: planPrice,
          quantity: 1,
          productId: planProductIds[data.plan],
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

    // 7. Update order with dodo checkout ID
    await db.update(orders)
      .set({ dodoCheckoutId: checkout.id })
      .where(eq(orders.id, newOrder.id));

    return { success: true, url: checkout.url };
  } catch (error: any) {
    console.error("Create Upgrade Checkout Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserRoleAction(targetUserId: string, newRole: "admin" | "business" | "customer") {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  // Prevent admin from changing their own role (accidental lockout)
  if (session.user.id === targetUserId) {
    return { success: false, error: "You cannot change your own admin role." };
  }

  try {
    await db.update(users)
      .set({ role: newRole })
      .where(eq(users.id, targetUserId));

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user role:", error);
    return { success: false, error: error.message || "Failed to update user role" };
  }
}

export async function deleteUserAction(targetUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  // Prevent self-deletion
  if (session.user.id === targetUserId) {
    return { success: false, error: "You cannot delete your own admin account." };
  }

  try {
    // 1. Set products.supplierId = null for any products linked to this user
    await db.update(products)
      .set({ supplierId: null })
      .where(eq(products.supplierId, targetUserId));

    // 2. Delete executions & workflows
    // Since executions reference userWorkflows, delete executions first
    await db.delete(workflowExecutions).where(eq(workflowExecutions.userId, targetUserId));
    await db.delete(userWorkflows).where(eq(userWorkflows.userId, targetUserId));

    // 3. Delete api keys, subscriptions, supplier applications, accounts, sessions
    await db.delete(aiApiKeys).where(eq(aiApiKeys.userId, targetUserId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, targetUserId));
    await db.delete(supplierApplications).where(eq(supplierApplications.userId, targetUserId));
    
    // 4. Delete orders & order items
    // First find orders for this user to delete their orderItems
    const userOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.userId, targetUserId));
    for (const o of userOrders) {
      await db.delete(orderItems).where(eq(orderItems.orderId, o.id));
    }
    await db.delete(orders).where(eq(orders.userId, targetUserId));

    // 5. Delete accounts and sessions
    await db.delete(accounts).where(eq(accounts.userId, targetUserId));
    await db.delete(sessions).where(eq(sessions.userId, targetUserId));

    // 6. Delete user
    await db.delete(users).where(eq(users.id, targetUserId));

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}

export async function updateProfileSettingsAction(data: { name: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data.name || data.name.trim() === "") {
    return { success: false, error: "Name is required" };
  }

  try {
    await db.update(users)
      .set({ name: data.name })
      .where(eq(users.id, session.user.id));
    
    revalidatePath("/dashboard/customer/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile settings" };
  }
}
