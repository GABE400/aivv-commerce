import { db } from "./index";
import { workflowTemplates } from "./schema";

async function main() {
  console.log("Seeding workflow templates...");

  const templates = [
    {
      slug: "product-copy",
      name: "Product Copy & Descriptions",
      description: "Generate item names, titles, and SEO meta tags.",
      category: "content",
      defaultModel: "claude-3-5-sonnet",
      defaultProvider: "anthropic",
      promptTemplate: "Generate a product description for {{productName}} with features: {{features}}.",
      inputSchema: JSON.stringify({
        productName: "string",
        features: "string",
      }),
      outputSchema: JSON.stringify({
        title: "string",
        description: "string",
        seoTags: "array",
      }),
    },
    {
      slug: "email-responder",
      name: "Customer Email Auto-Responder",
      description: "Handles shipment notifications and buyer tracking support.",
      category: "support",
      defaultModel: "gpt-4o",
      defaultProvider: "openai",
      promptTemplate: "Draft an email reply to a customer regarding {{issue}}. Context: {{context}}.",
      inputSchema: JSON.stringify({
        issue: "string",
        context: "string",
      }),
      outputSchema: JSON.stringify({
        subject: "string",
        body: "string",
      }),
    },
    {
      slug: "inventory-sync",
      name: "Inventory Sync & Mappings",
      description: "Correlates Printify product options to local variants.",
      category: "operations",
      defaultModel: "none",
      defaultProvider: "none",
      promptTemplate: "Map these supplier items {{supplierItems}} to local variants {{localVariants}}.",
      inputSchema: JSON.stringify({
        supplierItems: "string",
        localVariants: "string",
      }),
      outputSchema: JSON.stringify({
        mappings: "array",
      }),
    },
  ];

  for (const t of templates) {
    await db.insert(workflowTemplates)
      .values(t)
      .onConflictDoUpdate({
        target: workflowTemplates.slug,
        set: t,
      });
  }

  console.log("Workflow templates seeded successfully.");
}

main().catch((err) => {
  console.error("Error seeding workflow templates:", err);
  process.exit(1);
});
