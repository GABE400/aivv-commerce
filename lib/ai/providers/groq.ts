import Groq from "groq-sdk";
import { AIProvider, GenerateOptions, AIResponse } from "./types";

export const groqProvider: AIProvider = {
  id: "groq",
  name: "Groq",
  async generateText(prompt: string, apiKey: string, options: GenerateOptions): Promise<AIResponse> {
    const client = new Groq({ apiKey });
    const response = await client.chat.completions.create({
      model: options.model,
      temperature: options.temperature,
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.maxTokens,
    });

    return {
      text: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0,
    };
  },
  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const client = new Groq({ apiKey });
      await client.chat.completions.create({
        model: "llama3-8b-8192",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      });
      return true;
    } catch {
      return false;
    }
  }
};
