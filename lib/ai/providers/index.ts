import { AIProvider } from "./types";
import { anthropicProvider } from "./anthropic";
import { openaiProvider } from "./openai";
import { groqProvider } from "./groq";
import { deepseekProvider } from "./deepseek";
import { geminiProvider } from "./gemini";
import { openrouterProvider } from "./openrouter";

export const providers: Record<string, AIProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  groq: groqProvider,
  deepseek: deepseekProvider,
  gemini: geminiProvider,
  openrouter: openrouterProvider,
};

export function getProvider(id: string): AIProvider {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`AI Provider '${id}' not found or not supported.`);
  }
  return provider;
}

export * from "./types";
