"use server";

import { db } from "@/lib/db";
import { subscriptions, aiApiKeys, userWorkflows, workflowTemplates, workflowExecutions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { encrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

export async function getUserSubscription() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  if (session.user.role === "admin") {
    return {
      id: "admin-free",
      userId: session.user.id,
      plan: "agency",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const result = await db.select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, "active")))
    .limit(1);

  return result[0] || null;
}

export async function getUserWorkflows() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const results = await db.select({
    workflow: userWorkflows,
    template: workflowTemplates,
  })
    .from(userWorkflows)
    .leftJoin(workflowTemplates, eq(userWorkflows.templateId, workflowTemplates.id))
    .where(eq(userWorkflows.userId, session.user.id));

  return results.map(r => ({
    ...r.workflow,
    template: r.template,
  }));
}

export async function getUserApiKeys() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const keys = await db.select({
    id: aiApiKeys.id,
    provider: aiApiKeys.provider,
    isValid: aiApiKeys.isValid,
    lastValidatedAt: aiApiKeys.lastValidatedAt,
  })
    .from(aiApiKeys)
    .where(eq(aiApiKeys.userId, session.user.id));

  return keys;
}

export async function saveApiKey(provider: string, key: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const { encrypted, iv } = encrypt(key);

  const existing = await db.select().from(aiApiKeys).where(and(eq(aiApiKeys.userId, session.user.id), eq(aiApiKeys.provider, provider))).limit(1);

  if (existing.length > 0) {
    await db.update(aiApiKeys)
      .set({ encryptedKey: encrypted, iv, isValid: true, lastValidatedAt: new Date() })
      .where(eq(aiApiKeys.id, existing[0].id));
  } else {
    await db.insert(aiApiKeys).values({
      userId: session.user.id,
      provider,
      encryptedKey: encrypted,
      iv,
      isValid: true,
      lastValidatedAt: new Date(),
    });
  }

  revalidatePath("/dashboard/customer/automate");
  return { success: true };
}

export async function deleteApiKey(provider: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.delete(aiApiKeys)
    .where(and(eq(aiApiKeys.userId, session.user.id), eq(aiApiKeys.provider, provider)));

  revalidatePath("/dashboard/customer/automate");
  return { success: true };
}

export async function activateWorkflow(templateId: string, provider: string, model: string, customPrompt?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const existing = await db.select().from(userWorkflows).where(and(eq(userWorkflows.userId, session.user.id), eq(userWorkflows.templateId, templateId))).limit(1);

  if (existing.length > 0) {
    await db.update(userWorkflows)
      .set({ provider, model, customPrompt, status: "active" })
      .where(eq(userWorkflows.id, existing[0].id));
  } else {
    await db.insert(userWorkflows).values({
      userId: session.user.id,
      templateId,
      provider,
      model,
      customPrompt,
      status: "active",
    });
  }

  revalidatePath("/dashboard/customer/automate");
  return { success: true };
}

export async function deactivateWorkflow(userWorkflowId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.update(userWorkflows)
    .set({ status: "paused" })
    .where(and(eq(userWorkflows.id, userWorkflowId), eq(userWorkflows.userId, session.user.id)));

  revalidatePath("/dashboard/customer/automate");
  return { success: true };
}

export async function getWorkflowHistory(userWorkflowId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const results = await db.select()
    .from(workflowExecutions)
    .where(and(eq(workflowExecutions.userWorkflowId, userWorkflowId), eq(workflowExecutions.userId, session.user.id)))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(50);

  return results;
}

export async function updateWorkflowCustomPrompt(workflowId: string, customPrompt: string | null) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.update(userWorkflows)
    .set({ customPrompt })
    .where(and(eq(userWorkflows.id, workflowId), eq(userWorkflows.userId, session.user.id)));

  revalidatePath("/dashboard/customer/automate");
  return { success: true };
}

export async function deleteWorkflowExecution(executionId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.delete(workflowExecutions)
    .where(and(eq(workflowExecutions.id, executionId), eq(workflowExecutions.userId, session.user.id)));

  revalidatePath("/dashboard/customer/automate/history");
  return { success: true };
}

export async function clearWorkflowHistory() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.delete(workflowExecutions)
    .where(eq(workflowExecutions.userId, session.user.id));

  revalidatePath("/dashboard/customer/automate/history");
  return { success: true };
}

export async function updateWorkflowConfigAction(workflowId: string, config: string | null) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.update(userWorkflows)
    .set({ config, updatedAt: new Date() })
    .where(and(eq(userWorkflows.id, workflowId), eq(userWorkflows.userId, session.user.id)));

  revalidatePath("/dashboard/customer/automate");
  return { success: true };
}
