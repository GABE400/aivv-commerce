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
      defaultModel: "llama-3.3-70b-versatile",
      defaultProvider: "groq",
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
      defaultModel: "llama-3.3-70b-versatile",
      defaultProvider: "groq",
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
      defaultModel: "llama-3.3-70b-versatile",
      defaultProvider: "groq",
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
    {
      slug: "lead-outreach",
      name: "Cold Sales Outreach & Copywriter",
      description: "Generate high-converting cold sales email sequences, LinkedIn outreach templates, and elevator pitches to win new clients.",
      category: "sales",
      defaultModel: "llama-3.3-70b-versatile",
      defaultProvider: "groq",
      promptTemplate: "Draft a sales pitch for channel {{pitchChannel}} targeting {{targetAudience}} based on the value proposition: {{valueProposition}}.",
      inputSchema: JSON.stringify({
        valueProposition: { type: "longtext", label: "Value Proposition / Core Product Description", placeholder: "Describe what you sell, your key benefits, and case studies..." },
        targetAudience: { type: "text", label: "Target Prospect (e.g. SaaS Founders, CMOs, local shops)", placeholder: "e.g. CMOs of mid-sized e-commerce brands" },
        pitchChannel: { type: "text", label: "Preferred Channel (e.g. Cold Email, LinkedIn, Elevator Pitch)", placeholder: "e.g. Cold Email Sequence" }
      }),
      outputSchema: JSON.stringify({
        subject: "Clear subject line or Hook Angle",
        body: "The complete outreach pitch body, professionally written",
        result: "Comprehensive pitch sequence including email/LinkedIn copy, hook variations, and a 1-day follow-up script."
      }),
    },
    {
      slug: "sales-proposal",
      name: "AI Proposal & Scope of Work Writer",
      description: "Generate detailed business proposals, estimations, and structured scopes of work (SOW) from client briefs.",
      category: "sales",
      defaultModel: "llama-3.3-70b-versatile",
      defaultProvider: "groq",
      promptTemplate: "Draft a professional business proposal for the following brief: {{clientBrief}} offering services: {{servicesOffered}} with pricing model: {{pricingDetails}}.",
      inputSchema: JSON.stringify({
        clientBrief: { type: "longtext", label: "Client Brief or Meeting Transcript", placeholder: "Paste client specifications, transcript, notes, or project brief here..." },
        servicesOffered: { type: "longtext", label: "Services & Deliverables Provided", placeholder: "e.g. 5 SEO blog posts, 1 SEO landing page, 3 hours setup" },
        pricingDetails: { type: "text", label: "Pricing Structure (e.g. $5,000 flat, hourly, weekly retainer)", placeholder: "e.g. $4,500 flat fee (50% upfront, 50% on completion)" }
      }),
      outputSchema: JSON.stringify({
        result: "The full formal proposal and Scope of Work (SOW) text",
        extractedData: {
          clientName: "Identified client or company name",
          servicesCount: "Approximate number of key services/deliverables identified",
          estimatedCost: "Extracted estimated cost or pricing structure string"
        }
      }),
    },
    {
      slug: "seo-campaign",
      name: "SEO Campaign & Blog Strategy Planner",
      description: "Generate keyword maps, content calendars, and article outlining strategies to drive high-intent organic traffic.",
      category: "marketing",
      defaultModel: "llama-3.3-70b-versatile",
      defaultProvider: "groq",
      promptTemplate: "Plan an SEO campaign for topic: {{topicDescription}} with primary target keywords: {{primaryKeywords}}.",
      inputSchema: JSON.stringify({
        topicDescription: { type: "longtext", label: "Topic / Core Product & Service Description", placeholder: "What is the business, or what topic are you targeting?" },
        primaryKeywords: { type: "text", label: "Primary Keywords (comma separated)", placeholder: "e.g. ai coding assistant, dev tools, developer productivity" }
      }),
      outputSchema: JSON.stringify({
        result: "The comprehensive SEO marketing strategy, content calendar, blog post outline, and titles."
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
