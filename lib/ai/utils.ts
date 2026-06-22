/**
 * Attempts to parse a JSON string from LLM responses robustly.
 * Handles:
 * 1. Markdown code blocks (```json ... ```)
 * 2. Conversational filler before or after the JSON block
 * 3. Unescaped control characters (newlines, tabs, etc.) inside JSON string values
 */
export function robustParseJSON(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();

  // 1. Strip markdown code block wrappers if they exist
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // 2. Try parsing immediately
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Continue to robust parsing
  }

  // 3. Try to locate the main JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found");
  }

  const candidate = cleaned.substring(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(candidate);
  } catch (err) {
    // Continue to character-by-character escaping
  }

  // 4. Escape raw control characters (like newlines) inside JSON string values
  let result = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < candidate.length; i++) {
    const char = candidate[i];

    if (inString) {
      if (escapeNext) {
        result += char;
        escapeNext = false;
      } else if (char === "\\") {
        result += char;
        escapeNext = true;
      } else if (char === '"') {
        result += char;
        inString = false;
      } else if (char === "\n") {
        result += "\\n"; // escape literal newline
      } else if (char === "\r") {
        result += "\\r"; // escape literal carriage return
      } else if (char === "\t") {
        result += "\\t"; // escape literal tab
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }

  try {
    return JSON.parse(result);
  } catch (err) {
    throw err;
  }
}
