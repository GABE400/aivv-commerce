import "dotenv/config";
import { db } from "../lib/db";
import { userWorkflows, workflowTemplates } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Fetching user workflows...");
  const results = await db.select({
    id: userWorkflows.id,
    userId: userWorkflows.userId,
    provider: userWorkflows.provider,
    model: userWorkflows.model,
    status: userWorkflows.status,
    templateName: workflowTemplates.name,
    templateSlug: workflowTemplates.slug,
  })
  .from(userWorkflows)
  .leftJoin(workflowTemplates, eq(userWorkflows.templateId, workflowTemplates.id));

  console.log("Database results:", JSON.stringify(results, null, 2));
}

main().catch(console.error);
