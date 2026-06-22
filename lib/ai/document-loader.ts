// Trigger recompile to resolve cached module resolution
// @ts-ignore
import pdf from "pdf-parse";

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text || "";
  } catch (error) {
    console.error("Failed to parse PDF using pdf-parse:", error);
    return "";
  }
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
    const extractedText = await extractTextFromPdfBuffer(buffer);
    if (!extractedText || !extractedText.trim()) {
      return "[Empty PDF or non-extractable scanned document]";
    }
    return extractedText;
  }

  // Text, csv, xml, json, md, etc.
  return buffer.toString("utf8");
}
