export function buildInventorySyncPrompt(supplierItems: string, localVariants: string) {
  return `You are an inventory management assistant.
You need to map supplier product variants to local store variants based on matching attributes like size, color, and SKU.

Supplier Items: ${supplierItems}
Local Variants: ${localVariants}

Return your response strictly as JSON matching this schema:
{
  "mappings": [
    {
      "supplierItemId": "ID of supplier item",
      "localVariantId": "ID of matching local variant",
      "confidence": "0-100 score indicating match certainty as a number"
    }
  ]
}`;
}
