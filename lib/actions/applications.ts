"use server";

import { db } from "@/lib/db";
import { supplierApplications, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function submitSupplierApplicationAction(data: {
  storeName: string;
  website?: string;
  description?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in first." };
  }

  try {
    // Check for existing pending application
    const existing = await db.query.supplierApplications.findFirst({
      where: and(
        eq(supplierApplications.userId, session.user.id),
        eq(supplierApplications.status, "pending")
      )
    });

    if (existing) {
      return { success: false, error: "You already have a pending application." };
    }

    await db.insert(supplierApplications).values({
      userId: session.user.id,
      storeName: data.storeName,
      website: data.website,
      description: data.description,
    });

    revalidatePath("/dashboard/customer");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reviewApplicationAction(applicationId: string, status: "approved" | "rejected", adminNotes?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  try {
    await db.transaction(async (tx) => {
      // 1. Update Application Status
      const [app] = await tx.update(supplierApplications)
        .set({ status, adminNotes, updatedAt: new Date() })
        .where(eq(supplierApplications.id, applicationId))
        .returning();

      // 2. If approved, update User Role
      if (status === "approved") {
        await tx.update(users)
          .set({ role: "business" })
          .where(eq(users.id, app.userId));
      }
    });

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/customer");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
