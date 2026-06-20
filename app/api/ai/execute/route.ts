import { NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/ai/engine";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userWorkflowId, input } = body;

    if (!userWorkflowId || !input) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const result = await executeWorkflow({
      userId: session.user.id,
      userWorkflowId,
      input,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Workflow Execution Error:", error);
    return NextResponse.json({ error: error.message || "Execution failed" }, { status: 500 });
  }
}
