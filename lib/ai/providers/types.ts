export interface GenerateOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  tokensUsed: number;
}

export interface AIProvider {
  id: string;
  name: string;
  generateText(prompt: string, apiKey: string, options: GenerateOptions): Promise<AIResponse>;
  validateKey(apiKey: string): Promise<boolean>;
}
