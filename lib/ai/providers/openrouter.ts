import OpenAI from "openai";
import { AIProvider, GenerateOptions, AIResponse } from "./types";

export const openrouterProvider: AIProvider = {
  id: "openrouter",
  name: "OpenRouter",
  async generateText(prompt: string, apiKey: string, options: GenerateOptions): Promise<AIResponse> {
    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://aivv-commerce.com",
        "X-Title": "Automated Intelligent Virtual Ventures",
      }
    });

    const response = await client.chat.completions.create({
      model: options.model,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.maxTokens ?? 1024,
    });

    return {
      text: response.choices[0]?.message?.content || "",
      tokensUsed: response.usage?.total_tokens || 0,
    };
  },
  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const client = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://aivv-commerce.com",
          "X-Title": "Automated Intelligent Virtual Ventures",
        }
      });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
};
