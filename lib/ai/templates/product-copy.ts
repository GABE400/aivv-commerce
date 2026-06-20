export function buildProductCopyPrompt(productName: string, features: string) {
  return `You are an expert ecommerce copywriter.
Generate a compelling product title, description, and SEO keywords for the following product:

Product Name: ${productName}
Features: ${features}

Return your response strictly as JSON matching this schema:
{
  "title": "A catchy, SEO-optimized title",
  "description": "A persuasive 2-3 paragraph product description highlighting the features",
  "seoTags": ["tag1", "tag2", "tag3"]
}`;
}
