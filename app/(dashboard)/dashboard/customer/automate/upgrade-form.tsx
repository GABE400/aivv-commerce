"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, Suspense } from "react";
import { createUpgradeCheckoutAction } from "@/lib/actions/users";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, Sparkles, Key, Bot, DollarSign, Check } from "lucide-react";
import Link from "next/link";

const upgradeSchema = z.object({
  storeName: z.string().min(2, "Business name must be at least 2 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Please describe your business or automation goals"),
  anthropicKey: z.string().optional(),
  openaiKey: z.string().optional(),
  groqKey: z.string().optional(),
  deepseekKey: z.string().optional(),
  geminiKey: z.string().optional(),
  openrouterKey: z.string().optional(),
  productModel: z.string(),
  emailModel: z.string(),
  inventoryModel: z.string(),
  plan: z.enum(["free", "starter", "growth", "agency"]),
  agreeUpgrade: z.boolean().refine((val) => val === true, {
    message: "You must agree to upgrade your account",
  }),
});

type UpgradeFormValues = z.infer<typeof upgradeSchema>;

function AutomateUpgradeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData } = authClient.useSession();
  const isAdmin = (sessionData?.user as any)?.role === "admin";

  const queryBusinessName = searchParams.get("businessName") || "";

  const form = useForm<UpgradeFormValues>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: {
      storeName: queryBusinessName,
      website: "",
      description: "",
      anthropicKey: "",
      openaiKey: "",
      groqKey: "",
      deepseekKey: "",
      geminiKey: "",
      openrouterKey: "",
      productModel: "claude-3-5-sonnet",
      emailModel: "gpt-4o",
      inventoryModel: "none",
      plan: "free",
      agreeUpgrade: false,
    },
  });

  // Pre-fill business/company name if present in query parameters
  useEffect(() => {
    if (queryBusinessName) {
      form.setValue("storeName", queryBusinessName);
    }
  }, [queryBusinessName, form]);

  useEffect(() => {
    if (isAdmin) {
      form.setValue("plan", "agency");
    }
  }, [isAdmin, form]);

  const plan = form.watch("plan");

  const onSubmit = async (data: UpgradeFormValues) => {
    // Helper function to check if a specific model provider requires a key
    const checkKeyRequirement = (modelPrefix: string, providerName: string, keyVal?: string) => {
      const isModelUsed = 
        data.productModel.includes(modelPrefix) || 
        data.emailModel.includes(modelPrefix) || 
        data.inventoryModel.includes(modelPrefix);
      if (isModelUsed && !keyVal) {
        toast.error(`Please provide an API Key for ${providerName} to use its models.`);
        return false;
      }
      return true;
    };

    if (!checkKeyRequirement("claude-3-5-sonnet", "Anthropic", data.anthropicKey)) return;
    if (!checkKeyRequirement("gpt-4o", "OpenAI", data.openaiKey)) return;
    if (!checkKeyRequirement("llama-3-groq", "Groq", data.groqKey)) return;
    if (!checkKeyRequirement("deepseek-v3", "DeepSeek", data.deepseekKey)) return;
    if (!checkKeyRequirement("gemini-1-5-pro", "Google Gemini", data.geminiKey)) return;
    if (!checkKeyRequirement("openrouter", "OpenRouter", data.openrouterKey)) return;

    setIsLoading(true);
    try {
      const summaryDescription = `${data.description} | AI Task Config: [Product Copy: ${data.productModel}] [Emails: ${data.emailModel}] [Inventory: ${data.inventoryModel}] | Configured Providers: ` +
        `[Anthropic: ${data.anthropicKey ? "Yes" : "No"}] ` +
        `[OpenAI: ${data.openaiKey ? "Yes" : "No"}] ` +
        `[Groq: ${data.groqKey ? "Yes" : "No"}] ` +
        `[DeepSeek: ${data.deepseekKey ? "Yes" : "No"}] ` +
        `[Gemini: ${data.geminiKey ? "Yes" : "No"}] ` +
        `[OpenRouter: ${data.openrouterKey ? "Yes" : "No"}]`;

      const result = await createUpgradeCheckoutAction({
        storeName: data.storeName,
        website: data.website,
        description: summaryDescription,
        plan: data.plan,
        apiKeys: {
          anthropic: data.anthropicKey,
          openai: data.openaiKey,
          groq: data.groqKey,
          deepseek: data.deepseekKey,
          gemini: data.geminiKey,
          openrouter: data.openrouterKey,
        },
        workflows: {
          productModel: data.productModel,
          emailModel: data.emailModel,
          inventoryModel: data.inventoryModel,
        }
      });

      if (result.success) {
        if (result.bypassPayment) {
          toast.success("Account upgraded successfully (Admin Free Access)!");
          window.location.href = "/dashboard";
        } else if (result.url) {
          toast.success("Checkout session created. Redirecting to payment...");
          window.location.href = result.url;
        } else {
          toast.error("Failed to generate checkout link.");
        }
      } else {
        toast.error(result.error || "Failed to upgrade account");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to Dashboard
        </Link>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Upgrade Account</h2>
          <h1 className="text-3xl font-bold">Turn into a Business</h1>
        </div>
      </div>

      <Card className="glass border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent animate-pulse" />
            AI Automation Setup
          </CardTitle>
          <CardDescription>
            Provide details about your business, select a subscription plan, and configure your task-specific AI models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Business / Company Name</Label>
              <Input 
                id="storeName" 
                {...form.register("storeName")} 
                placeholder="e.g. Acme Automation Corp" 
                className="glass border-glass-border"
              />
              {form.formState.errors.storeName && (
                <p className="text-xs text-red-500">{form.formState.errors.storeName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website or Social Handle (Optional)</Label>
              <Input 
                id="website" 
                {...form.register("website")} 
                placeholder="https://mybusiness.com" 
                className="glass border-glass-border"
              />
              {form.formState.errors.website && (
                <p className="text-xs text-red-500">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Overview & Goals</Label>
              <textarea 
                id="description" 
                {...form.register("description")}
                className="w-full min-h-[100px] rounded-xl glass border border-glass-border bg-transparent p-4 text-sm focus:border-accent outline-none"
                placeholder="Brief description of what your business does..."
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Plan Selection Cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <DollarSign className="size-4 text-accent" />
                <span>1. Select Subscription Tier</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: "free", name: "Free Plan", price: "$0/mo", desc: "1 workflow, 1 API Key, community guides." },
                  { id: "starter", name: "Starter Plan", price: isAdmin ? "$0 (Free for Admin)" : "$29/mo", desc: "5 workflows, 1 API Key, remote guides." },
                  { id: "growth", name: "Growth Plan", price: isAdmin ? "$0 (Free for Admin)" : "$79/mo", desc: "20 workflows, unlimited API Keys, Webhooks." },
                  { id: "agency", name: "Agency Plan", price: isAdmin ? "$0 (Free for Admin)" : "$199/mo", desc: "Unlimited workflows, team logs, custom setups." }
                ].map((tier) => {
                  const isSelected = plan === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      disabled={isAdmin}
                      onClick={() => !isAdmin && form.setValue("plan", tier.id as any)}
                      className={`relative p-5 rounded-2xl text-left flex flex-col justify-between min-h-[150px] transition-all duration-200 outline-none ${
                        isAdmin 
                          ? (isSelected 
                              ? "bg-[#1E2440] border-2 border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.3)] opacity-95" 
                              : "bg-[#1A1F35] border border-[#2A2F4A] opacity-40 cursor-not-allowed") 
                          : (isSelected 
                              ? "bg-[#1E2440] border-2 border-[#5B4FE8] shadow-[0_0_0_3px_rgba(91,79,232,0.3)] cursor-pointer" 
                              : "bg-[#1A1F35] border border-[#2A2F4A] hover:bg-[#1E2440] hover:border-[#5B4FE8] hover:shadow-[0_0_0_2px_rgba(91,79,232,0.2)] cursor-pointer")
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">{tier.name}</div>
                        <div className="text-xl font-black text-white mt-1">{tier.price}</div>
                        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{tier.desc}</p>
                      </div>
                      {isSelected && (
                        <div className={`absolute top-3 right-3 ${isAdmin ? "text-emerald-500" : "text-[#5B4FE8]"}`}>
                          <Check className="size-4" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Keys Configuration */}
            <div className="p-4 rounded-xl border border-glass-border bg-[#1A1F35]/40 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Key className="size-4 text-accent" />
                <span>2. Connect Your AI API Keys</span>
              </div>
              <p className="text-xs text-muted-foreground">
                We do not supply default AI models. Input your own API keys to enable automation. Keys are encrypted and processed locally.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anthropicKey">Anthropic API Key (Claude)</Label>
                    <Input 
                      id="anthropicKey" 
                      type="password"
                      {...form.register("anthropicKey")} 
                      placeholder="sk-ant-..." 
                      className="glass border-glass-border font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openaiKey">OpenAI API Key (ChatGPT)</Label>
                    <Input 
                      id="openaiKey" 
                      type="password"
                      {...form.register("openaiKey")} 
                      placeholder="sk-..." 
                      className="glass border-glass-border font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openrouterKey">OpenRouter API Key</Label>
                    <Input 
                      id="openrouterKey" 
                      type="password"
                      {...form.register("openrouterKey")} 
                      placeholder="sk-or-v1-..." 
                      className="glass border-glass-border font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="groqKey">Groq API Key</Label>
                    <Input 
                      id="groqKey" 
                      type="password"
                      {...form.register("groqKey")} 
                      placeholder="gsk_..." 
                      className="glass border-glass-border font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deepseekKey">DeepSeek API Key</Label>
                    <Input 
                      id="deepseekKey" 
                      type="password"
                      {...form.register("deepseekKey")} 
                      placeholder="sk-..." 
                      className="glass border-glass-border font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="geminiKey">Google Gemini API Key</Label>
                    <Input 
                      id="geminiKey" 
                      type="password"
                      {...form.register("geminiKey")} 
                      placeholder="AIzaSy..." 
                      className="glass border-glass-border font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Task specific Model Routing */}
            <div className="p-4 rounded-xl border border-glass-border bg-[#1A1F35]/40 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Bot className="size-4 text-accent" />
                <span>3. Task-Specific AI Model Selection</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Map different AI models to individual tasks based on latency and cost requirements.
              </p>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border border-glass-border bg-[#1A1F35]/20">
                  <div>
                    <div className="text-xs font-bold text-white">Product Copy & Descriptions</div>
                    <div className="text-[10px] text-muted-foreground">Used for generating item names, titles, and SEO meta tags.</div>
                  </div>
                  <select 
                    {...form.register("productModel")}
                    className="h-9 rounded-lg border border-glass-border bg-[#1A1F35] text-xs text-white px-2 focus:border-accent outline-none w-full md:w-56"
                  >
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="llama-3-groq">Llama 3 70B (Groq)</option>
                    <option value="deepseek-v3">DeepSeek-V3 (DeepSeek)</option>
                    <option value="gemini-1-5-pro">Gemini 1.5 Pro (Google)</option>
                    <option value="openrouter/meta-llama/llama-3-8b-instruct:free">Llama 3 8B Free (OpenRouter)</option>
                    <option value="openrouter/google/gemini-2.5-pro">Gemini 2.5 Pro (OpenRouter)</option>
                    <option value="none">Manual Copywriting Only</option>
                  </select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border border-glass-border bg-[#1A1F35]/20">
                  <div>
                    <div className="text-xs font-bold text-white">Customer Email Auto-Responder</div>
                    <div className="text-[10px] text-muted-foreground">Handles shipment notifications and buyer tracking support.</div>
                  </div>
                  <select 
                    {...form.register("emailModel")}
                    className="h-9 rounded-lg border border-glass-border bg-[#1A1F35] text-xs text-white px-2 focus:border-accent outline-none w-full md:w-56"
                  >
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                    <option value="llama-3-groq">Llama 3 70B (Groq)</option>
                    <option value="deepseek-v3">DeepSeek-V3 (DeepSeek)</option>
                    <option value="gemini-1-5-pro">Gemini 1.5 Pro (Google)</option>
                    <option value="openrouter/meta-llama/llama-3-8b-instruct:free">Llama 3 8B Free (OpenRouter)</option>
                    <option value="openrouter/google/gemini-2.5-pro">Gemini 2.5 Pro (OpenRouter)</option>
                    <option value="none">Disabled</option>
                  </select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border border-glass-border bg-[#1A1F35]/20">
                  <div>
                    <div className="text-xs font-bold text-white">Inventory Sync & Mappings</div>
                    <div className="text-[10px] text-muted-foreground">Correlates Printify product options to local variants.</div>
                  </div>
                  <select 
                    {...form.register("inventoryModel")}
                    className="h-9 rounded-lg border border-glass-border bg-[#1A1F35] text-xs text-white px-2 focus:border-accent outline-none w-full md:w-56"
                  >
                    <option value="none">Disabled (Strict Sync)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="llama-3-groq">Llama 3 70B (Groq)</option>
                    <option value="deepseek-v3">DeepSeek-V3 (DeepSeek)</option>
                    <option value="gemini-1-5-pro">Gemini 1.5 Pro (Google)</option>
                    <option value="openrouter/meta-llama/llama-3-8b-instruct:free">Llama 3 8B Free (OpenRouter)</option>
                    <option value="openrouter/google/gemini-2.5-pro">Gemini 2.5 Pro (OpenRouter)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-muted/10 p-4 rounded-xl border border-glass-border/50">
              <Checkbox 
                id="agreeUpgrade" 
                checked={form.watch("agreeUpgrade")}
                onCheckedChange={(checked) => form.setValue("agreeUpgrade", checked as boolean, { shouldValidate: true })}
                className="mt-0.5 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white animate-none"
              />
              <Label htmlFor="agreeUpgrade" className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none">
                I agree to upgrade my Aivv account to a business profile. I understand I will immediately gain access to supplier tools and AI integrations.
              </Label>
            </div>
            {form.formState.errors.agreeUpgrade && (
              <p className="text-xs text-red-500">{form.formState.errors.agreeUpgrade.message}</p>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl accent-gradient text-white font-bold shadow-xl shadow-accent/20 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin mr-2" />
              ) : isAdmin ? (
                "Activate Free Admin Automation"
              ) : plan === "free" ? (
                "Activate Free Business Account"
              ) : (
                "Proceed to Payment & Activate"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AutomateUpgradePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin size-8 text-accent" />
      </div>
    }>
      <AutomateUpgradeForm />
    </Suspense>
  );
}
