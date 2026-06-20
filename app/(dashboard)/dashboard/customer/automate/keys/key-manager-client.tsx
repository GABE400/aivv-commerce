"use client";

import { useState } from "react";
import { saveApiKey, deleteApiKey } from "@/lib/actions/ai";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Key, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface KeyInfo {
  id: string;
  provider: string;
  isValid: boolean | null;
  lastValidatedAt: Date | null;
}

interface KeyManagerClientProps {
  initialKeys: KeyInfo[];
}

const PROVIDERS = [
  { id: "anthropic", name: "Anthropic (Claude)", desc: "For Claude 3.5 Sonnet and other Anthropic models.", placeholder: "sk-ant-..." },
  { id: "openai", name: "OpenAI (ChatGPT)", desc: "For GPT-4o, GPT-4o-mini and standard OpenAI models.", placeholder: "sk-proj-..." },
  { id: "openrouter", name: "OpenRouter", desc: "Access 100+ open-source and proprietary models.", placeholder: "sk-or-v1-..." },
  { id: "groq", name: "Groq", desc: "High-speed Llama-3 running on Groq LPU hardware.", placeholder: "gsk_..." },
  { id: "deepseek", name: "DeepSeek", desc: "Cost-efficient DeepSeek-V3 and DeepSeek-R1 models.", placeholder: "sk-..." },
  { id: "gemini", name: "Google Gemini", desc: "Google Gemini 1.5 Pro and Flash model suite.", placeholder: "AIzaSy..." },
];

export default function KeyManagerClient({ initialKeys }: KeyManagerClientProps) {
  const [keys, setKeys] = useState<Record<string, Partial<KeyInfo>>>(() => {
    const map: Record<string, Partial<KeyInfo>> = {};
    initialKeys.forEach((k) => {
      map[k.provider] = k;
    });
    return map;
  });

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleInputChange = (provider: string, val: string) => {
    setInputs((prev) => ({ ...prev, [provider]: val }));
  };

  const handleSave = async (provider: string) => {
    const key = inputs[provider]?.trim();
    if (!key) {
      toast.error("Please enter a key before validating.");
      return;
    }

    setLoading((prev) => ({ ...prev, [provider]: true }));
    try {
      // 1. Validate the API Key first
      const res = await fetch("/api/ai/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: key }),
      });

      const validation = await res.json();
      if (!validation.valid) {
        toast.error(`Invalid API Key for ${provider}. Please verify and try again.`);
        return;
      }

      // 2. Save the API Key to the DB
      const saveRes = await saveApiKey(provider, key);
      if (saveRes.success) {
        setKeys((prev) => ({
          ...prev,
          [provider]: {
            provider,
            isValid: true,
            lastValidatedAt: new Date(),
          },
        }));
        setInputs((prev) => ({ ...prev, [provider]: "" }));
        toast.success(`Successfully connected and validated ${provider} API Key!`);
      } else {
        toast.error("Failed to save API key.");
      }
    } catch (error) {
      toast.error("An error occurred while validating the API key.");
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleDelete = async (provider: string) => {
    if (!confirm(`Are you sure you want to revoke and delete your ${provider} API Key?`)) {
      return;
    }

    setLoading((prev) => ({ ...prev, [provider]: true }));
    try {
      const res = await deleteApiKey(provider);
      if (res.success) {
        setKeys((prev) => {
          const next = { ...prev };
          delete next[provider];
          return next;
        });
        toast.success(`Revoked and removed ${provider} API Key.`);
      }
    } catch (error) {
      toast.error(`Failed to revoke key for ${provider}.`);
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PROVIDERS.map((p) => {
        const keyData = keys[p.id];
        const isConfigured = !!keyData;
        const keyInput = inputs[p.id] || "";
        const isLoading = !!loading[p.id];

        return (
          <Card key={p.id} className="glass border-glass-border flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="size-4 text-accent" />
                  {p.name}
                </CardTitle>
                {isConfigured ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    Missing Key
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.desc}</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor={`key-${p.id}`} className="text-xs text-muted-foreground">
                  {isConfigured ? "Update API Key" : "Add API Key"}
                </Label>
                <Input
                  id={`key-${p.id}`}
                  type="password"
                  value={keyInput}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                  placeholder={p.placeholder}
                  disabled={isLoading}
                  className="glass border-glass-border font-mono text-xs h-10 bg-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleSave(p.id)}
                  disabled={isLoading || !keyInput}
                  size="sm"
                  className="flex-1 bg-accent hover:bg-accent/80 text-white font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin mr-1" />
                  ) : isConfigured ? (
                    "Update & Verify"
                  ) : (
                    "Save & Verify"
                  )}
                </Button>
                {isConfigured && (
                  <Button
                    onClick={() => handleDelete(p.id)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="aspect-square p-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center rounded-lg"
                    title="Revoke Key"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
