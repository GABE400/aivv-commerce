import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, GenerateOptions, AIResponse } from "./types";

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  name: "Anthropic",
  async generateText(prompt: string, apiKey: string, options: GenerateOptions): Promise<AIResponse> {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return {
      text,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  },
  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const client = new Anthropic({ apiKey });
      await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      });
      return true;
    } catch {
      return false;
    }
  }
};
