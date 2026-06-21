import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { workflows, workflowRuns } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { workflowEngine } from "@/lib/workflow-engine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, session.user.id)))
      .limit(1);

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (workflow.status !== "active") {
      return NextResponse.json(
        { error: "Workflow is not active. Please resume the workflow before running it manually." },
        { status: 400 }
      );
    }

    // Trigger immediate run
    const success = await workflowEngine.executeWorkflow(id);

    // Get the latest run details to return
    const [latestRun] = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, id))
      .orderBy(desc(workflowRuns.ranAt))
      .limit(1);

    if (!success) {
      return NextResponse.json(
        { error: "Workflow execution failed.", run: latestRun },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, run: latestRun });
  } catch (error: any) {
    console.error("Manual Workflow Run Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger workflow execution" },
      { status: 500 }
    );
  }
}
