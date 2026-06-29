import cron, { ScheduledTask } from "node-cron";
import parser from "cron-parser";
import { db } from "@/lib/db";
import { workflows, workflowRuns, users, orders, productVariants } from "@/lib/db/schema";
import { eq, gte, lte, sql } from "drizzle-orm";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import nodemailer from "nodemailer";
import { decryptApiKey } from "@/lib/encryption";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class WorkflowEngine {
  private static instance: WorkflowEngine | null = null;
  private jobs: Map<string, ScheduledTask> = new Map();
  private initialized = false;

  private constructor() {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  public async initialize() {
    if (this.initialized) {
      console.log("Workflow engine already initialized. Skipping.");
      return;
    }

    console.log("Initializing Workflow Engine...");
    this.initialized = true;

    // Load active workflows from DB
    try {
      const activeWorkflows = await db
        .select()
        .from(workflows)
        .where(eq(workflows.status, "active"));

      console.log(`Found ${activeWorkflows.length} active workflows to schedule.`);
      for (const workflow of activeWorkflows) {
        this.scheduleWorkflow(workflow);
      }
      console.log("Workflow Engine initialization complete.");
    } catch (error) {
      console.error("Failed to load workflows during engine initialization:", error);
      this.initialized = false;
    }
  }

  public scheduleWorkflow(workflow: typeof workflows.$inferSelect) {
    const workflowId = workflow.id;

    // Unschedule if already scheduled
    this.unscheduleWorkflow(workflowId);

    // Validate cron
    if (!cron.validate(workflow.schedule)) {
      console.error(`Invalid cron schedule: "${workflow.schedule}" for workflow ID ${workflowId}. Skipping.`);
      db.update(workflows)
        .set({ status: "error", updatedAt: new Date() })
        .where(eq(workflows.id, workflowId))
        .then(() => console.log(`Marked workflow ${workflowId} as error due to invalid cron.`))
        .catch(err => console.error(`Failed to mark workflow ${workflowId} as error:`, err));
      return;
    }

    console.log(`Scheduling workflow ${workflow.name} (ID: ${workflowId}) with cron "${workflow.schedule}"`);

    // Setup cron task
    const task = cron.schedule(workflow.schedule, async () => {
      console.log(`[Cron Trigger] Running workflow ${workflow.name} (ID: ${workflowId})`);
      await this.executeWorkflow(workflowId);
    });

    this.jobs.set(workflowId, task);

    // Update next run time in DB if possible
    try {
      const interval = parser.parse(workflow.schedule);
      const nextRun = interval.next().toDate();
      db.update(workflows)
        .set({ nextRunAt: nextRun })
        .where(eq(workflows.id, workflowId))
        .catch(err => console.error("Failed to update nextRunAt on schedule:", err));
    } catch (e) {
      // ignore
    }
  }

  public unscheduleWorkflow(workflowId: string) {
    if (this.jobs.has(workflowId)) {
      console.log(`Unscheduling workflow ID: ${workflowId}`);
      const task = this.jobs.get(workflowId);
      task?.stop();
      this.jobs.delete(workflowId);
    }
  }

  // State manipulation methods
  public async add(workflow: typeof workflows.$inferSelect) {
    this.scheduleWorkflow(workflow);
  }

  public async pause(workflowId: string) {
    this.unscheduleWorkflow(workflowId);
    await db
      .update(workflows)
      .set({ status: "paused", nextRunAt: null, updatedAt: new Date() })
      .where(eq(workflows.id, workflowId));
  }

  public async resume(workflowId: string) {
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, workflowId))
      .limit(1);

    if (workflow) {
      await db
        .update(workflows)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(workflows.id, workflowId));
      
      const updatedWorkflow = { ...workflow, status: "active" };
      this.scheduleWorkflow(updatedWorkflow);
    }
  }

  public async delete(workflowId: string) {
    this.unscheduleWorkflow(workflowId);
  }

  public async executeWorkflow(workflowId: string): Promise<boolean> {
    const startTime = Date.now();

    // 1. Fetch workflow
    const workflowList = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
    const workflow = workflowList[0];
    if (!workflow || workflow.status !== "active") {
      console.warn(`Attempted to execute non-existent or inactive workflow: ${workflowId}`);
      return false;
    }

    // 2. Insert workflowRun record as running
    const [run] = await db.insert(workflowRuns).values({
      workflowId: workflow.id,
      userId: workflow.userId,
      status: "running",
      ranAt: new Date(),
    }).returning();

    try {
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
        console.error("Failed to fetch real-time telemetry metrics for cron engine prompt:", err);
      }

      const finalPrompt = businessContext ? businessContext + "\n" + workflow.prompt : workflow.prompt;

      // 3. Get AI Response
      const aiResult = await this.getAIResponse(workflow.provider, finalPrompt, workflow.apiKey);

      // 4. Update workflow next execution times
      let nextRun: Date | null = null;
      try {
        const interval = parser.parse(workflow.schedule);
        nextRun = interval.next().toDate();
      } catch (e) {
        console.error("Failed to parse cron schedule for next run:", e);
      }

      await db.update(workflows)
        .set({
          lastRunAt: new Date(),
          nextRunAt: nextRun,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, workflow.id));

      // 5. If outputType is "email" or "both", send email
      if (workflow.outputType === "email" || workflow.outputType === "both") {
        let emailTo = workflow.emailRecipient;
        if (!emailTo) {
          const userList = await db.select().from(users).where(eq(users.id, workflow.userId)).limit(1);
          emailTo = userList[0]?.email || "";
        }
        if (emailTo) {
          await this.sendWorkflowEmail(workflow.name, emailTo, aiResult.text);
        }
      }

      // 6. Update run record as completed
      await db.update(workflowRuns)
        .set({
          status: "completed",
          output: aiResult.text,
          tokensUsed: aiResult.tokensUsed,
          durationMs: Date.now() - startTime,
        })
        .where(eq(workflowRuns.id, run.id));

      return true;
    } catch (error: any) {
      console.error(`Workflow execution failed for ID ${workflow.id}:`, error);

      let nextRun: Date | null = null;
      try {
        const interval = parser.parse(workflow.schedule);
        nextRun = interval.next().toDate();
      } catch (e) {
        // ignore
      }

      await db.update(workflows)
        .set({
          lastRunAt: new Date(),
          nextRunAt: nextRun,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, workflow.id));

      // Update run record as failed
      await db.update(workflowRuns)
        .set({
          status: "failed",
          error: error.message || String(error),
          durationMs: Date.now() - startTime,
        })
        .where(eq(workflowRuns.id, run.id));

      return false;
    }
  }

  private async getAIResponse(
    provider: string,
    prompt: string,
    encryptedApiKey: string | null
  ): Promise<{ text: string; tokensUsed: number }> {
    const apiKey = encryptedApiKey ? decryptApiKey(encryptedApiKey) : null;

    switch (provider) {
      case "groq": {
        const groqKey = apiKey || process.env.GROQ_API_KEY;
        if (!groqKey) {
          throw new Error("Groq API key not found. Please connect your Groq key or ensure GROQ_API_KEY is set.");
        }
        const groq = createOpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: groqKey,
        });
        const response = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          prompt,
        });
        return {
          text: response.text,
          tokensUsed: response.usage?.totalTokens || 0,
        };
      }
      case "openai": {
        const openaiKey = apiKey || process.env.OPENAI_API_KEY;
        if (!openaiKey) {
          throw new Error("OpenAI API key not found. Please connect your OpenAI key.");
        }
        const openai = createOpenAI({
          apiKey: openaiKey,
        });
        const response = await generateText({
          model: openai("gpt-4o"),
          prompt,
        });
        return {
          text: response.text,
          tokensUsed: response.usage?.totalTokens || 0,
        };
      }
      case "claude": {
        const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
          throw new Error("Anthropic API key not found. Please connect your Anthropic key.");
        }
        const anthropic = createAnthropic({
          apiKey: anthropicKey,
        });
        const response = await generateText({
          model: anthropic("claude-3-5-sonnet-20241022"),
          prompt,
        });
        return {
          text: response.text,
          tokensUsed: response.usage?.totalTokens || 0,
        };
      }
      case "gemini": {
        const geminiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!geminiKey) {
          throw new Error("Gemini API key not found. Please connect your Gemini key.");
        }
        const google = createGoogleGenerativeAI({
          apiKey: geminiKey,
        });
        const response = await generateText({
          model: google("gemini-1.5-flash"),
          prompt,
        });
        return {
          text: response.text,
          tokensUsed: response.usage?.totalTokens || 0,
        };
      }
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async sendWorkflowEmail(workflowName: string, to: string, content: string) {
    const formattedContent = content
      .split("\n")
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return "<br/>";
        const escaped = trimmed
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
        return `<p style="margin: 0 0 16px 0;">${escaped}</p>`;
      })
      .join("");

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || `"Aivv Automation" <noreply@aivv.com>`,
      to,
      subject: `[Aivv Automation] ${workflowName} Report`,
      html: `
        <div style="background-color: #0B0E14; color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px; min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <h1 style="color: #6366F1; font-size: 24px; margin-top: 0; margin-bottom: 8px; font-weight: 700; letter-spacing: -0.025em;">Aivv Automation</h1>
            <h2 style="color: #F3F4F6; font-size: 18px; margin-top: 0; margin-bottom: 24px; font-weight: 600;">${workflowName}</h2>
            <div style="border-top: 1px solid #1F2937; padding-top: 24px; margin-top: 24px; font-size: 15px; line-height: 1.6; color: #D1D5DB;">
              ${formattedContent}
            </div>
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #1F2937; font-size: 12px; color: #9CA3AF; text-align: center;">
              Sent via Aivv Workflow Engine. Powering business on autopilot.
            </div>
          </div>
        </div>
      `,
    });
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
