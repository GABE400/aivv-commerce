import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { workflows, workflowRuns } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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

    // Check ownership of the workflow
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, session.user.id)))
      .limit(1);

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Parse query params for pagination
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "10"), 1), 100);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1"), 1);
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, id));

    const total = countResult?.count || 0;

    // Fetch the runs
    const runsList = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, id))
      .orderBy(desc(workflowRuns.ranAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      runs: runsList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET Workflow Runs Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch run logs" },
      { status: 500 }
    );
  }
}
