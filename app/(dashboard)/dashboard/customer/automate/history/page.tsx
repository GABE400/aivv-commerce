import { db } from "@/lib/db";
import { workflowExecutions, userWorkflows, workflowTemplates } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import HistoryClient from "./history-client";

export default async function HistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Fetch recent executions joined with workflow template names
  const executions = await db.select({
    id: workflowExecutions.id,
    userWorkflowId: workflowExecutions.userWorkflowId,
    status: workflowExecutions.status,
    input: workflowExecutions.input,
    output: workflowExecutions.output,
    error: workflowExecutions.error,
    tokensUsed: workflowExecutions.tokensUsed,
    durationMs: workflowExecutions.durationMs,
    createdAt: workflowExecutions.createdAt,
    workflowName: workflowTemplates.name,
    model: userWorkflows.model,
  })
    .from(workflowExecutions)
    .leftJoin(userWorkflows, eq(workflowExecutions.userWorkflowId, userWorkflows.id))
    .leftJoin(workflowTemplates, eq(userWorkflows.templateId, workflowTemplates.id))
    .where(eq(workflowExecutions.userId, session.user.id))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(50);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/customer/automate" 
          className="p-2 rounded-lg bg-glass border border-glass-border hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Execution History</h1>
          <p className="text-muted-foreground text-sm mt-1">Review your recent automated workflow runs, latency stats, and outputs.</p>
        </div>
      </div>

      <HistoryClient initialExecutions={executions} />
    </div>
  );
}
