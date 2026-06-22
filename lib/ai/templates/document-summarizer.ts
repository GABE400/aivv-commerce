export function buildDocumentSummarizerPrompt(documentText: string, targetLength: string) {
  return `You are an AI business intelligence assistant.
Analyze and summarize the provided text/document. The summary should be approximately: ${targetLength}.

Document Content:
${documentText}

Return your response strictly as JSON matching this schema:
{
  "summary": "The structured summary of the document, using bullet points or paragraphs as appropriate",
  "keyTakeaways": ["key point 1", "key point 2"],
  "actionItems": ["action item 1", "action item 2"]
}`;
}
