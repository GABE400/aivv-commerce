import { db } from "@/lib/db";
import { userWorkflows, workflowTemplates, aiApiKeys, workflowExecutions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { getProvider } from "./providers";
import { buildDocumentSummarizerPrompt } from "./templates/document-summarizer";
import { buildEmailResponderPrompt } from "./templates/email-responder";
import { buildInvoiceAssistantPrompt } from "./templates/invoice-assistant";

export async function executeWorkflow(params: {
  userId: string;
  userWorkflowId: string;
  input: Record<string, any>;
}) {
  const { userId, userWorkflowId, input } = params;

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

  // 3. Build Prompt
  let prompt = "";
  if (template.slug === "document-summarizer") {
    prompt = buildDocumentSummarizerPrompt(input.documentText || "", input.targetLength || "");
  } else if (template.slug === "email-responder") {
    prompt = buildEmailResponderPrompt(input.customerEmail || "", input.tone || "");
  } else if (template.slug === "invoice-assistant") {
    prompt = buildInvoiceAssistantPrompt(input.invoiceData || "", input.task || "");
  } else {
    throw new Error(`Unknown workflow template slug: ${template.slug}`);
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

    // 6. Attempt to parse JSON response
    let outputData;
    try {
      const cleanedText = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
      outputData = JSON.parse(cleanedText);
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
