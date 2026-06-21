import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { encryptApiKey } from "@/lib/encryption";
import { workflowEngine } from "@/lib/workflow-engine";
import cron from "node-cron";
import parser from "cron-parser";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      type,
      schedule,
      prompt,
      provider,
      apiKey,
      outputType,
      emailRecipient,
    } = body;

    // Validate required fields
    if (!name || !type || !schedule || !prompt || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, schedule, prompt, provider" },
        { status: 400 }
      );
    }

    // Validate cron expression
    if (!cron.validate(schedule)) {
      return NextResponse.json({ error: "Invalid cron schedule expression" }, { status: 400 });
    }

    // Calculate next run time
    let nextRunAt: Date | null = null;
    try {
      const interval = parser.parse(schedule);
      nextRunAt = interval.next().toDate();
    } catch (e) {
      // ignore parser error
    }

    // Encrypt API key if provided
    const encryptedKey = apiKey ? encryptApiKey(apiKey) : null;

    // Insert into database
    const [newWorkflow] = await db
      .insert(workflows)
      .values({
        userId: session.user.id,
        name,
        description,
        type,
        schedule,
        prompt,
        provider,
        apiKey: encryptedKey,
        outputType: outputType || "email",
        emailRecipient,
        status: "active",
        nextRunAt,
      })
      .returning();

    // Schedule in engine
    workflowEngine.scheduleWorkflow(newWorkflow);

    return NextResponse.json(newWorkflow);
  } catch (error: any) {
    console.error("Create Workflow Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create workflow" }, { status: 500 });
  }
}
