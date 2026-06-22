export function buildSeoCampaignPrompt(topicDescription: string, primaryKeywords: string) {
  return `You are a digital marketing director and SEO search strategist.
Your task is to create a complete SEO strategy and Content Marketing Campaign outline.

Business/Topic Description:
${topicDescription}

Primary Target Keywords:
${primaryKeywords}

Your campaign should output:
1. Additional secondary keywords and search intent analysis.
2. A 4-week blog post calendar (titles and descriptions).
3. A detailed outline for the first pillar article to drive high-intent organic traffic.

Generate the response in a structured marketing plan layout. Avoid raw markdown characters like # or **.

Return your response strictly as JSON matching this schema:
{
  "result": "The comprehensive SEO marketing strategy, content calendar, blog post outline, and titles. Format cleanly and professionally without raw markdown symbols."
}`;
}
