export function buildInvoiceAssistantPrompt(invoiceData: string, task: string) {
  return `You are an AI financial operations assistant.
Perform the following task on the invoice/billing data: ${task}.

Invoice/Billing Data:
${invoiceData}

Return your response strictly as JSON matching this schema:
{
  "result": "The main output of the task (e.g. the reminder email draft, the mapping table, or analysis)",
  "extractedData": {
    "invoiceNumber": "string or null",
    "totalAmount": "string or null",
    "dueDate": "string or null",
    "itemsCount": "number or null"
  }
}`;
}
