"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Play, Sparkles, Clipboard, Check, FileText, Mail, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlaygroundClientProps {
  userWorkflowId: string;
  inputSchemaStr: string;
  outputSchemaStr: string;
}

interface InputField {
  type: "text" | "longtext";
  label: string;
  placeholder?: string;
}

export function WorkflowPlayground({
  userWorkflowId,
  inputSchemaStr,
  outputSchemaStr,
}: PlaygroundClientProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Parse input schema safely
  let inputSchema: Record<string, InputField> = {};
  try {
    inputSchema = JSON.parse(inputSchemaStr || "{}");
  } catch (e) {
    console.error("Failed to parse input schema", e);
  }

  const handleInputChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/ai/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userWorkflowId,
          input: inputs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Execution failed");
      }

      if (data.success) {
        setResult(data.data);
        toast.success(`Workflow executed successfully! (Duration: ${data.durationMs}ms)`);
      } else {
        throw new Error(data.error || "Workflow failed to return success status");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to execute workflow");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Result copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderResultData = () => {
    if (!result) return null;

    // Custom formatting helper
    const hasSummary = "summary" in result;
    const hasEmail = "subject" in result && "body" in result;
    const hasResultField = "result" in result;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="size-4 text-accent animate-pulse" />
            AI Execution Result
          </h3>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-white"
            onClick={() => handleCopy(JSON.stringify(result, null, 2))}
          >
            {copied ? <Check className="size-3.5 mr-1" /> : <Clipboard className="size-3.5 mr-1" />}
            Copy JSON
          </Button>
        </div>

        {/* Dynamic Display Formatting */}
        {hasSummary && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
              <div className="text-xs font-bold text-accent uppercase flex items-center gap-1">
                <FileText className="size-3.5" />
                Executive Summary
              </div>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </div>

            {result.keyTakeaways && result.keyTakeaways.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-white uppercase">Key Takeaways</div>
                <ul className="space-y-1.5">
                  {result.keyTakeaways.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.actionItems && result.actionItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-white uppercase">Action Items</div>
                <ul className="space-y-2">
                  {result.actionItems.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                      <input type="checkbox" className="mt-0.5 rounded border-glass-border bg-transparent text-accent focus:ring-0 cursor-pointer" />
                      <span className="text-xs text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {hasEmail && (
          <div className="space-y-4">
            <div className="rounded-xl border border-glass-border overflow-hidden">
              <div className="bg-[#1E2440] px-4 py-3 border-b border-glass-border flex items-center gap-2 text-xs">
                <Mail className="size-3.5 text-accent" />
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-semibold text-white">{result.subject}</span>
              </div>
              <div className="p-5 bg-black/20 text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                {result.body}
              </div>
            </div>
            <Button
              onClick={() => handleCopy(result.body)}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium"
            >
              Copy Email Body
            </Button>
          </div>
        )}

        {hasResultField && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
              <div className="text-xs font-bold text-accent uppercase flex items-center gap-1">
                <FileCheck className="size-3.5" />
                Operations Task Output
              </div>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{result.result}</p>
            </div>

            {result.extractedData && Object.keys(result.extractedData).length > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-glass-border space-y-3">
                <div className="text-xs font-bold text-white uppercase">Extracted Key Metrics</div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(result.extractedData).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-3 rounded-lg bg-black/10 border border-white/5">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{key.replace(/([A-Z])/g, " $1")}</div>
                      <div className="text-sm font-semibold text-white mt-1">{val !== null ? String(val) : <span className="text-muted-foreground font-normal italic">N/A</span>}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catch-all JSON viewer if none of the above formats match */}
        {!hasSummary && !hasEmail && !hasResultField && (
          <pre className="p-4 rounded-xl bg-black/35 border border-glass-border text-xs text-emerald-400 overflow-x-auto font-mono max-h-[300px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleRun} className="space-y-4">
        {Object.entries(inputSchema).map(([key, field]) => {
          const isTextArea = field.type === "longtext";
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-xs font-semibold text-gray-300">
                {field.label}
              </Label>
              {isTextArea ? (
                <textarea
                  id={key}
                  required
                  placeholder={field.placeholder}
                  value={inputs[key] || ""}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="w-full min-h-[140px] rounded-xl glass border border-glass-border bg-transparent p-4 text-sm text-white focus:border-accent outline-none placeholder:text-muted-foreground/60 leading-relaxed"
                />
              ) : (
                <Input
                  id={key}
                  required
                  placeholder={field.placeholder}
                  value={inputs[key] || ""}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="h-12 rounded-xl glass border-glass-border focus:border-accent text-white"
                />
              )}
            </div>
          );
        })}

        <Button
          type="submit"
          disabled={isLoading || Object.keys(inputSchema).length === 0}
          className="w-full h-12 rounded-xl accent-gradient text-white font-semibold cursor-pointer shadow-lg shadow-accent/15"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Executing AI Reasoning Engine...
            </>
          ) : (
            <>
              <Play className="size-4 mr-2" />
              Execute Automation
            </>
          )}
        </Button>
      </form>

      {result && (
        <div className="p-5 rounded-2xl bg-[#1A1F35] border border-glass-border">
          {renderResultData()}
        </div>
      )}
    </div>
  );
}
