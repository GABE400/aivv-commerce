import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { workflowEngine } from "@/lib/workflow-engine";

export async function PATCH(
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

    // Call engine pause
    await workflowEngine.pause(id);

    return NextResponse.json({ success: true, message: "Workflow paused successfully" });
  } catch (error: any) {
    console.error("Pause Workflow Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to pause workflow" },
      { status: 500 }
    );
  }
}
