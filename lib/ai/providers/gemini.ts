import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, GenerateOptions, AIResponse } from "./types";

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Google Gemini",
  async generateText(prompt: string, apiKey: string, options: GenerateOptions): Promise<AIResponse> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: options.model });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
      }
    });

    const response = await result.response;
    const text = response.text();
    
    return {
      text,
      tokensUsed: response.usageMetadata?.totalTokenCount || 0,
    };
  },
  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Hi" }] }],
        generationConfig: { maxOutputTokens: 1 }
      });
      return true;
    } catch {
      return false;
    }
  }
};
