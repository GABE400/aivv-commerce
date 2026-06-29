import { db } from "@/lib/db";
import { userWorkflows, workflowTemplates, aiApiKeys, workflowExecutions, orders, productVariants } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { getProvider } from "./providers";
import { verifyExecutionLimit } from "@/lib/actions/limits";
import { buildDocumentSummarizerPrompt } from "./templates/document-summarizer";
import { buildEmailResponderPrompt } from "./templates/email-responder";
import { buildInvoiceAssistantPrompt } from "./templates/invoice-assistant";
import { buildLeadOutreachPrompt } from "./templates/lead-outreach";
import { buildSalesProposalPrompt } from "./templates/sales-proposal";
import { buildSeoCampaignPrompt } from "./templates/seo-campaign";
import { robustParseJSON } from "./utils";
import { UserWorkflowConfig } from "./types";


export async function executeWorkflow(params: {
  userId: string;
  userWorkflowId: string;
  input: Record<string, any>;
}) {
  const { userId, userWorkflowId, input } = params;

  // Enforce subscription monthly run limit check
  await verifyExecutionLimit(userId);

  // 1. Fetch user workflow and template
  const uwResult = await db.select()
    .from(userWorkflows)
    .leftJoin(workflowTemplates, eq(userWorkflows.templateId, workflowTemplates.id))
    .where(and(eq(userWorkflows.id, userWorkflowId), eq(userWorkflows.userId, userId)))
    .limit(1);

  if (!uwResult.length || !uwResult[0].user_workflow || !uwResult[0].workflow_template) {
    throw new Error("Workflow not found.");
  }

  const uw = uwResult[0].user_workflow;
  const template = uwResult[0].workflow_template;

  if (uw.status !== "active") {
    throw new Error(`Workflow is currently ${uw.status}.`);
  }

  // 2. Fetch encrypted API key
  const keyResult = await db.select()
    .from(aiApiKeys)
    .where(and(eq(aiApiKeys.userId, userId), eq(aiApiKeys.provider, uw.provider)))
    .limit(1);

  let apiKey: string | null = null;

  if (keyResult.length > 0) {
    const apiKeyData = keyResult[0];
    apiKey = decrypt(apiKeyData.encryptedKey, apiKeyData.iv);
  }

  // Fallback for Groq (default platform AI) if no user key is connected
  if (!apiKey && uw.provider === "groq") {
    apiKey = process.env.GROQ_API_KEY || null;
  }

  if (!apiKey) {
    throw new Error(`API Key for provider ${uw.provider} not found. Please connect your API key in settings.`);
  }

  // If a file is attached, fetch and parse it to override or supplement the text input
  if (input.fileUrl) {
    try {
      const { loadDocumentContent } = await import("./document-loader");
      const extractedText = await loadDocumentContent(input.fileUrl, input.fileName || "uploaded_file");
      
      if (template.slug === "document-summarizer") {
        input.documentText = (input.documentText || "") + "\n\n[Attached Document Content:]\n" + extractedText;
      } else if (template.slug === "email-responder") {
        input.customerEmail = (input.customerEmail || "") + "\n\n[Attached Email Document:]\n" + extractedText;
      } else if (template.slug === "invoice-assistant") {
        input.invoiceData = (input.invoiceData || "") + "\n\n[Attached Invoice Data:]\n" + extractedText;
      } else if (template.slug === "lead-outreach") {
        input.valueProposition = (input.valueProposition || "") + "\n\n[Attached Company Brief:]\n" + extractedText;
      } else if (template.slug === "sales-proposal") {
        input.clientBrief = (input.clientBrief || "") + "\n\n[Attached Meeting Notes/Brief:]\n" + extractedText;
      } else if (template.slug === "seo-campaign") {
        input.topicDescription = (input.topicDescription || "") + "\n\n[Attached Topic Brief:]\n" + extractedText;
      }
    } catch (e: any) {
      console.error("Failed to extract content from attached file:", e);
    }
  }

  // 2.5 Fetch real-time store metrics for prompt context seeding
  let businessContext = "";
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Fetch today's orders
    const todayOrders = await db.select()
      .from(orders)
      .where(gte(orders.createdAt, startOfToday));
    const salesToday = todayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);

    // Fetch pending orders count
    const pendingOrdersResult = await db.select({
      count: sql<number>`count(*)`
    })
      .from(orders)
      .where(eq(orders.status, "pending"));
    const pendingOrdersCount = Number(pendingOrdersResult[0]?.count || 0);

    // Fetch low stock variants (under 5 units)
    const lowStockVariants = await db.select()
      .from(productVariants)
      .where(lte(productVariants.inventory, 5))
      .limit(5);

    const stockAlerts = lowStockVariants.map(v => `${v.name} (SKU: ${v.sku}) - Stock: ${v.inventory}`).join(", ") || "None";

    businessContext = `
[AIVV OS SYSTEM REAL-TIME BUSINESS TELEMETRY CONTEXT]
- Today's Date: ${new Date().toLocaleDateString()}
- Revenue Today: $${salesToday.toFixed(2)}
- Pending Orders Count: ${pendingOrdersCount}
- Low Stock Alerts: ${stockAlerts}
[END SYSTEM TELEMETRY CONTEXT - Use this context to answer questions, compile reports, or draft communications if relevant. Otherwise, proceed with the task.]
`;
  } catch (err) {
    console.error("Failed to fetch real-time telemetry metrics for prompt:", err);
  }

  // 3. Build Prompt
  let prompt = "";
  if (template.slug === "document-summarizer") {
    prompt = buildDocumentSummarizerPrompt(input.documentText || "", input.targetLength || "");
  } else if (template.slug === "email-responder") {
    prompt = buildEmailResponderPrompt(input.customerEmail || "", input.tone || "");
  } else if (template.slug === "invoice-assistant") {
    prompt = buildInvoiceAssistantPrompt(input.invoiceData || "", input.task || "");
  } else if (template.slug === "lead-outreach") {
    prompt = buildLeadOutreachPrompt(input.valueProposition || "", input.targetAudience || "", input.pitchChannel || "");
  } else if (template.slug === "sales-proposal") {
    prompt = buildSalesProposalPrompt(input.clientBrief || "", input.servicesOffered || "", input.pricingDetails || "");
  } else if (template.slug === "seo-campaign") {
    prompt = buildSeoCampaignPrompt(input.topicDescription || "", input.primaryKeywords || "");
  } else {
    throw new Error(`Unknown workflow template slug: ${template.slug}`);
  }

  if (businessContext) {
    prompt = businessContext + "\n" + prompt;
  }

  // Allow custom prompt override if user defined one
  if (uw.customPrompt) {
    prompt = uw.customPrompt + "\n\n" + prompt;
  }

  // 4. Create Execution Log (Pending)
  const [execution] = await db.insert(workflowExecutions).values({
    userWorkflowId: uw.id,
    userId: userId,
    input: JSON.stringify(input),
    status: "running",
  }).returning();

  const startTime = Date.now();

  try {
    // 5. Call Provider
    const provider = getProvider(uw.provider);
    const aiResponse = await provider.generateText(prompt, apiKey, {
      model: uw.model,
      temperature: 0.7,
      maxTokens: 1024,
    });

    const durationMs = Date.now() - startTime;

    // 6. Attempt to parse JSON response robustly
    let outputData;
    try {
      outputData = robustParseJSON(aiResponse.text);
    } catch {
      // Fallback to raw text if not strictly JSON
      outputData = { raw: aiResponse.text };
    }

    // 7. Update Execution Log (Success)
    await db.update(workflowExecutions)
      .set({
        status: "completed",
        output: JSON.stringify(outputData),
        tokensUsed: aiResponse.tokensUsed,
        durationMs,
      })
      .where(eq(workflowExecutions.id, execution.id));

    // Dispatch to Pipedream webhook if enabled
    if (uw.config) {
      try {
        const configData = JSON.parse(uw.config) as UserWorkflowConfig;
        if (configData.enablePipedream && configData.pipedreamWebhookUrl) {
          fetch(configData.pipedreamWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event: "workflow_execution",
              workflow: {
                id: uw.id,
                name: template.name,
                slug: template.slug,
              },
              execution: {
                id: execution.id,
                durationMs,
                tokensUsed: aiResponse.tokensUsed,
                timestamp: new Date().toISOString(),
              },
              input,
              output: outputData,
            }),
          }).catch(err => {
            console.error("Failed to push to Pipedream webhook asynchronously:", err);
          });
        }
      } catch (webhookErr) {
        console.error("Failed to trigger Pipedream integration:", webhookErr);
      }
    }

    return {
      success: true,
      data: outputData,
      tokensUsed: aiResponse.tokensUsed,
      durationMs,
    };
  } catch (error: any) {
    // 8. Update Execution Log (Failure)
    await db.update(workflowExecutions)
      .set({
        status: "failed",
        error: error.message || "Unknown execution error",
        durationMs: Date.now() - startTime,
      })
      .where(eq(workflowExecutions.id, execution.id));

    throw error;
  }
}
