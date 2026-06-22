import "dotenv/config";

function extractTextFromPdfBuffer(buffer: Buffer): string {
  const text = buffer.toString("binary");
  
  // Tj operator: (string) Tj
  const tjRegex = /\((.*?)\)\s*Tj/g;
  // TJ operator: [(string) number (string)] TJ
  const tjArrayRegex = /\[(.*?)[\]\)]\s*TJ/g;
  
  let result = "";
  let match;
  
  while ((match = tjRegex.exec(text)) !== null) {
    result += match[1] + " ";
  }
  
  while ((match = tjArrayRegex.exec(text)) !== null) {
    const arrayContent = match[1];
    const stringParts = arrayContent.match(/\((.*?)\)/g);
    if (stringParts) {
      result += stringParts.map(s => s.slice(1, -1)).join("") + " ";
    }
  }
  
  // Clean up PDF octal escape sequences (e.g. \357\254\201) and basic escapes like \( or \)
  const cleaned = result
    .replace(/\\([\(\)])/g, "$1") // unescape parens
    .replace(/\\357\\254\\201/g, "fi") // common ligatures
    .replace(/\\(\d{3})/g, (_, octal) => {
      return String.fromCharCode(parseInt(octal, 8));
    })
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

export async function loadDocumentContent(url: string, fileName: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    const extractedText = extractTextFromPdfBuffer(buffer);
    if (!extractedText) {
      return "[Empty PDF or non-extractable scanned document]";
    }
    return extractedText;
  }

  // Text, csv, xml, json, md, etc.
  return buffer.toString("utf8");
}
