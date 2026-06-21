import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { workflows, workflowRuns } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { workflowEngine } from "@/lib/workflow-engine";

export async function GET(
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

    // Fetch the workflow
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, session.user.id)))
      .limit(1);

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Fetch last 10 runs
    const runs = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, id))
      .orderBy(desc(workflowRuns.ranAt))
      .limit(10);

    return NextResponse.json({ workflow, runs });
  } catch (error: any) {
    console.error("GET Single Workflow Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch workflow details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Stop execution in scheduling engine
    workflowEngine.unscheduleWorkflow(id);

    // Delete history logs first
    await db
      .delete(workflowRuns)
      .where(eq(workflowRuns.workflowId, id));

    // Delete workflow record
    await db
      .delete(workflows)
      .where(eq(workflows.id, id));

    return NextResponse.json({ success: true, message: "Workflow deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Workflow Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
