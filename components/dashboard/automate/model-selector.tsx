"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { activateWorkflow } from "@/lib/actions/ai";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ModelSelectorProps {
  templateId: string;
  currentProvider: string;
  currentModel: string;
  customPrompt?: string | null;
}

const PROVIDER_MODELS: Record<string, { value: string; label: string }[]> = {
  groq: [
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Default)" },
    { value: "deepseek-r1-distill-llama-70b", label: "DeepSeek R1 Llama 70B (Reasoning)" },
    { value: "groq/compound", label: "Groq Compound (Agentic)" },
    { value: "groq/compound-mini", label: "Groq Compound Mini (Agentic)" },
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Fast)" },
    { value: "llama-guard-3-8b", label: "Llama Guard 3 8B (Safety)" },
    { value: "gemma2-9b-it", label: "Gemma 2 9B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { value: "llama3-70b-8192", label: "Llama 3 70B" },
    { value: "llama3-8b-8192", label: "Llama 3 8B" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o (High Quality)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Cost Efficient)" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  ],
  gemini: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
  deepseek: [
    { value: "deepseek-chat", label: "DeepSeek-V3" },
  ],
  openrouter: [
    { value: "openrouter/meta-llama/llama-3-8b-instruct:free", label: "Llama 3 8B Free" },
    { value: "openrouter/google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  ],
};

const PROVIDERS = [
  { value: "groq", label: "Groq (Free default)" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "openrouter", label: "OpenRouter" },
];

export function ModelSelector({ templateId, currentProvider, currentModel, customPrompt }: ModelSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedProvider, setSelectedProvider] = useState(currentProvider.toLowerCase());
  const [selectedModel, setSelectedModel] = useState(currentModel);

  // Sync state if props change
  useEffect(() => {
    setSelectedProvider(currentProvider.toLowerCase());
    setSelectedModel(currentModel);
  }, [currentProvider, currentModel]);

  const models = PROVIDER_MODELS[selectedProvider] || [];

  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    const defaultModel = PROVIDER_MODELS[newProvider]?.[0]?.value || "";
    setSelectedModel(defaultModel);

    startTransition(async () => {
      try {
        const result = await activateWorkflow(templateId, newProvider, defaultModel, customPrompt || undefined);
        if (result.success) {
          toast.success(`Provider switched to ${newProvider} using ${defaultModel}`);
          router.refresh();
        } else {
          toast.error("Failed to update workflow provider.");
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred while switching provider.");
      }
    });
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    startTransition(async () => {
      try {
        const result = await activateWorkflow(templateId, selectedProvider, newModel, customPrompt || undefined);
        if (result.success) {
          toast.success(`Workflow model updated to ${newModel}`);
          router.refresh();
        } else {
          toast.error("Failed to update workflow model.");
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred while updating the model.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-semibold">Provider</label>
        <Select
          value={selectedProvider}
          disabled={isPending}
          onValueChange={handleProviderChange}
        >
          <SelectTrigger className="h-10 w-full glass border-glass-border text-xs focus:ring-0 text-foreground capitalize">
            <SelectValue placeholder="Select Provider" />
          </SelectTrigger>
          <SelectContent className="glass border-glass-border text-foreground bg-background dark:bg-[#111625]">
            {PROVIDERS.map((p) => (
              <SelectItem key={p.value} value={p.value} className="text-xs focus:bg-accent/15 focus:text-foreground hover:bg-accent/10 cursor-pointer">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-semibold">Model</label>
        <Select
          value={selectedModel}
          disabled={isPending || models.length === 0}
          onValueChange={handleModelChange}
        >
          <SelectTrigger className="h-10 w-full glass border-glass-border text-xs focus:ring-0 text-foreground">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent className="glass border-glass-border text-foreground bg-background dark:bg-[#111625]">
            {models.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs focus:bg-accent/15 focus:text-foreground hover:bg-accent/10 cursor-pointer">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <span className="text-[10px] text-accent flex items-center gap-1 animate-pulse">
          <Loader2 className="size-2.5 animate-spin" /> Saving configuration...
        </span>
      )}
    </div>
  );
}
