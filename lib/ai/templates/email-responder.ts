export function buildEmailResponderPrompt(issue: string, context: string) {
  return `You are a helpful customer support agent for an ecommerce store.
Draft an email to a customer regarding their issue. Keep the tone professional and empathetic.

Customer Issue: ${issue}
Context/Resolution: ${context}

Return your response strictly as JSON matching this schema:
{
  "subject": "Clear, relevant subject line",
  "body": "The complete email body"
}`;
}
