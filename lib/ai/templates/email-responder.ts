export function buildEmailResponderPrompt(customerEmail: string, tone: string) {
  return `You are an AI business communications assistant.
Draft an email reply to the incoming email. Use a tone of "${tone}".

Incoming Email:
${customerEmail}

Return your response strictly as JSON matching this schema:
{
  "subject": "Clear, relevant subject line",
  "body": "The complete email reply body"
}`;
}
