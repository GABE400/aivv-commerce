import "dotenv/config";
import { db } from "./index";
import { workflowTemplates } from "./schema";

async function main() {
  console.log("Seeding workflow templates...");

  const templates = [
    {
      slug: "document-summarizer",
      name: "Meeting & Document Summarizer",
      description: "Summarize meeting transcripts, notes, and general texts.",
      category: "productivity",
      defaultModel: "claude-3-5-sonnet-20241022",
      defaultProvider: "anthropic",
      promptTemplate: "Summarize the following document into a {{targetLength}} summary: {{documentText}}.",
      inputSchema: JSON.stringify({
        documentText: { type: "longtext", label: "Document / Transcript Content", placeholder: "Paste your transcript, meeting notes, or document text here..." },
        targetLength: { type: "text", label: "Target Length (e.g. 3 bullet points, 1 paragraph)", placeholder: "e.g. 3 bullet points" }
      }),
      outputSchema: JSON.stringify({
        summary: "The structured summary of the document, using bullet points or paragraphs as appropriate",
        keyTakeaways: ["key point 1", "key point 2"],
        actionItems: ["action item 1", "action item 2"]
      }),
    },
    {
      slug: "email-responder",
      name: "General Email Responder",
      description: "Draft replies to client inquiries, feedback, or follow-ups.",
      category: "communications",
      defaultModel: "gpt-4o",
      defaultProvider: "openai",
      promptTemplate: "Draft a professional email reply with a {{tone}} tone for the following email: {{customerEmail}}.",
      inputSchema: JSON.stringify({
        customerEmail: { type: "longtext", label: "Incoming Email Content", placeholder: "Paste the email you received..." },
        tone: { type: "text", label: "Reply Tone (e.g. Professional, Friendly, Apologetic)", placeholder: "e.g. Professional & empathetic" }
      }),
      outputSchema: JSON.stringify({
        subject: "Clear, relevant subject line",
        body: "The complete email reply body"
      }),
    },
    {
      slug: "invoice-assistant",
      name: "Invoice & Billing Assistant",
      description: "Extract details from invoices or generate payment reminders.",
      category: "operations",
      defaultModel: "none",
      defaultProvider: "none",
      promptTemplate: "Perform the task '{{task}}' on the following invoice/billing data: {{invoiceData}}.",
      inputSchema: JSON.stringify({
        invoiceData: { type: "longtext", label: "Raw Invoice / Billing Data", placeholder: "Paste invoice line items, XML, CSV, or text here..." },
        task: { type: "text", label: "Task (e.g. Extract total, Generate payment reminder, Map charges)", placeholder: "e.g. Extract total amount due and items" }
      }),
      outputSchema: JSON.stringify({
        result: "The main output of the task (e.g. the reminder email draft, the mapping table, or analysis)",
        extractedData: {
          invoiceNumber: "string or null",
          totalAmount: "string or null",
          dueDate: "string or null",
          itemsCount: "number or null"
        }
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
