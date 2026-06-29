import { db } from "@/lib/db";
import { subscriptions, userWorkflows, aiApiKeys, workflowExecutions } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface PlanLimits {
  plan: "free" | "starter" | "growth" | "agency";
  maxWorkflows: number;
  maxKeys: number;
  maxMonthlyRuns: number;
  allowCustomKeys: boolean;
  allowWebhooks: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    plan: "free",
    maxWorkflows: 1,
    maxKeys: 0,
    maxMonthlyRuns: 10,
    allowCustomKeys: false,
    allowWebhooks: false,
  },
  starter: {
    plan: "starter",
    maxWorkflows: 5,
    maxKeys: 1,
    maxMonthlyRuns: 1000000, // virtually unlimited
    allowCustomKeys: true,
    allowWebhooks: false,
  },
  growth: {
    plan: "growth",
    maxWorkflows: 20,
    maxKeys: 1000000,
    maxMonthlyRuns: 1000000,
    allowCustomKeys: true,
    allowWebhooks: true,
  },
  agency: {
    plan: "agency",
    maxWorkflows: 1000000,
    maxKeys: 1000000,
    maxMonthlyRuns: 1000000,
    allowCustomKeys: true,
    allowWebhooks: true,
  },
};

export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  // Query active subscription
  const result = await db.select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);

  const sub = result[0];
  const planName = sub?.plan || "free";
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
}

export async function verifyWorkflowActivationLimit(userId: string, templateId: string) {
  const limits = await getUserPlanLimits(userId);

  // 1. Check if the user is already activating this specific template (so it's an update, not a new one)
  const existing = await db.select()
    .from(userWorkflows)
    .where(and(eq(userWorkflows.userId, userId), eq(userWorkflows.templateId, templateId)))
    .limit(1);

  if (existing.length > 0 && existing[0].status === "active") {
    // Just updating, no limit increase
    return;
  }

  // 2. Count active workflows
  const activeCountResult = await db.select({
    count: sql<number>`count(*)`
  })
    .from(userWorkflows)
    .where(and(eq(userWorkflows.userId, userId), eq(userWorkflows.status, "active")));

  const activeCount = Number(activeCountResult[0]?.count || 0);

  if (activeCount >= limits.maxWorkflows) {
    throw new Error(`Your subscription plan (${limits.plan.toUpperCase()}) only allows up to ${limits.maxWorkflows} active workflow(s). Please upgrade to activate more workflows.`);
  }
}

export async function verifyApiKeyLimit(userId: string, provider: string) {
  const limits = await getUserPlanLimits(userId);

  if (!limits.allowCustomKeys) {
    throw new Error(`Your subscription plan (${limits.plan.toUpperCase()}) does not allow custom API keys. It is powered exclusively by Aivv's Groq infrastructure. Please upgrade your plan to connect custom models.`);
  }

  // Check if we are updating an existing key
  const existing = await db.select()
    .from(aiApiKeys)
    .where(and(eq(aiApiKeys.userId, userId), eq(aiApiKeys.provider, provider)))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  // Count total keys
  const keysCountResult = await db.select({
    count: sql<number>`count(*)`
  })
    .from(aiApiKeys)
    .where(eq(aiApiKeys.userId, userId));

  const keysCount = Number(keysCountResult[0]?.count || 0);

  if (keysCount >= limits.maxKeys) {
    throw new Error(`Your subscription plan (${limits.plan.toUpperCase()}) only allows up to ${limits.maxKeys} connected API key(s). Please upgrade your plan.`);
  }
}

export async function verifyExecutionLimit(userId: string) {
  const limits = await getUserPlanLimits(userId);

  // Calculate start of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count executions this month
  const runsCountResult = await db.select({
    count: sql<number>`count(*)`
  })
    .from(workflowExecutions)
    .where(
      and(
        eq(workflowExecutions.userId, userId),
        gte(workflowExecutions.createdAt, startOfMonth)
      )
    );

  const runsCount = Number(runsCountResult[0]?.count || 0);

  if (runsCount >= limits.maxMonthlyRuns) {
    throw new Error(`You have reached the monthly workflow execution limit (${limits.maxMonthlyRuns} runs) for your ${limits.plan.toUpperCase()} plan. Please upgrade to continue running automations.`);
  }
}

export async function verifyWebhookUsage(userId: string) {
  const limits = await getUserPlanLimits(userId);
  if (!limits.allowWebhooks) {
    throw new Error(`Webhook / Pipedream dispatch triggers are only available on GROWTH or AGENCY plans. Please upgrade your plan in settings.`);
  }
}
