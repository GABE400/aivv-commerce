export function buildSalesProposalPrompt(clientBrief: string, servicesOffered: string, pricingDetails: string) {
  return `You are a business consultant and operations specialist.
Your task is to convert client requirements/meeting transcripts into a formal Business Proposal and Scope of Work (SOW).

Client Brief / Requirements:
${clientBrief}

Services & Deliverables Offered:
${servicesOffered}

Pricing Details:
${pricingDetails}

Generate the response in a highly professional corporate layout. Avoid raw markdown characters like # or **. Ensure the proposal has clear headers, deliverables, pricing table, and next steps.

Return your response strictly as JSON matching this schema:
{
  "result": "The full formal proposal and Scope of Work (SOW) text. Ensure it is extremely professional, clear, and well-structured, formatted without raw markdown symbols.",
  "extractedData": {
    "clientName": "Identified client or company name (or null if not found)",
    "servicesCount": "Approximate number of key services/deliverables identified (as a number, or null)",
    "estimatedCost": "Extracted estimated cost or pricing structure string (or null)"
  }
}`;
}
