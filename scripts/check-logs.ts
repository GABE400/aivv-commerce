import "dotenv/config";
import { db } from "../lib/db";
import { workflowExecutions, workflowTemplates } from "../lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
  console.log("Fetching recent executions...");
  const results = await db.select({
    id: workflowExecutions.id,
    status: workflowExecutions.status,
    input: workflowExecutions.input,
    output: workflowExecutions.output,
    error: workflowExecutions.error,
    createdAt: workflowExecutions.createdAt,
  })
  .from(workflowExecutions)
  .orderBy(desc(workflowExecutions.createdAt))
  .limit(5);

  console.log("Recent Executions:", JSON.stringify(results, null, 2));
}

main().catch(console.error);
