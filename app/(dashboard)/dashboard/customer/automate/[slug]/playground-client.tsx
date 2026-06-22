"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Play, Sparkles, Clipboard, Check, FileText, Mail, FileCheck, Download, Paperclip } from "lucide-react";
import { FileUploader } from "@/components/admin/file-uploader";
import { robustParseJSON } from "@/lib/ai/utils";

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

// Helper to strip markdown formatting characters (*, #, _, `, etc.)
function stripMarkdown(md: string): string {
  if (!md) return "";
  return md
    // Strip bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Strip headers
    .replace(/^\s*#+\s+(.*)$/gm, "$1")
    // Strip lists markers but keep spacing
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, (match) => match.trim() + " ")
    // Strip blockquotes
    .replace(/^\s*>\s+/gm, "")
    // Strip backticks/code blocks
    .replace(/```[a-z]*\n([\s\S]*?)\n```/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export function WorkflowPlayground({
  userWorkflowId,
  inputSchemaStr,
  outputSchemaStr,
}: PlaygroundClientProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
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
          input: {
            ...inputs,
            fileUrl,
            fileName,
          },
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

  const downloadResponse = async () => {
    if (!result) return;
    
    let displayResult = result;
    if (result && typeof result === "object" && "raw" in result && typeof result.raw === "string") {
      try {
        const parsed = robustParseJSON(result.raw);
        if (parsed && typeof parsed === "object") {
          displayResult = parsed;
        }
      } catch {}
    }

    let textToDownload = "";
    let title = "AI Execution Response";

    if (displayResult.summary) {
      title = "Meeting & Document Summary";
      textToDownload += `SUMMARY:\n${stripMarkdown(displayResult.summary)}\n\n`;
      if (displayResult.keyTakeaways && displayResult.keyTakeaways.length > 0) {
        textToDownload += `KEY TAKEAWAYS:\n${displayResult.keyTakeaways.map((k: string) => `• ${stripMarkdown(k)}`).join("\n")}\n\n`;
      }
      if (displayResult.actionItems && displayResult.actionItems.length > 0) {
        textToDownload += `ACTION ITEMS:\n${displayResult.actionItems.map((a: string) => `[ ] ${stripMarkdown(a)}`).join("\n")}\n`;
      }
    } else if (displayResult.subject && displayResult.body) {
      title = "Email Responder Output";
      textToDownload += `SUBJECT: ${stripMarkdown(displayResult.subject)}\n\n${stripMarkdown(displayResult.body)}`;
    } else if (displayResult.result) {
      title = "Operations Task Output";
      textToDownload += stripMarkdown(displayResult.result);
    } else if (displayResult.raw) {
      title = "AI Automation Output";
      textToDownload += stripMarkdown(displayResult.raw);
    } else {
      textToDownload += JSON.stringify(displayResult, null, 2);
    }

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Premium Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(124, 58, 237); // Accent Violet
      doc.text("AIVV AI Operations Workspace", 14, 20);

      // Line separator
      doc.setDrawColor(229, 231, 235);
      doc.line(14, 25, 196, 25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(17, 24, 39); // Slate-900
      doc.text(title, 14, 35);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128); // Grey-500
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 41);

      // Body text styling
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55); // Gray-800

      // Split text into lines to wrap within margins
      const splitText = doc.splitTextToSize(textToDownload, 182);
      
      let y = 50;
      const pageHeight = doc.internal.pageSize.height; // 297 mm
      
      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], 14, y);
        y += 6;
      }

      // Add footer to all pages
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(156, 163, 175);
        doc.text(`Page ${i} of ${pageCount}`, 14, pageHeight - 10);
        doc.text("Aivv-Commerce B2B SaaS Platform", 138, pageHeight - 10);
      }

      doc.save(`aivv-ai-response-${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("AI Response downloaded as PDF!");
    } catch (err) {
      console.error("PDF generation failed, falling back to TXT:", err);
      // Fallback to text file download if PDF fails
      const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aivv-ai-response-${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Downloaded response as Text file.");
    }
  };

  const renderResultData = () => {
    if (!result) return null;

    let displayResult = result;
    if (result && typeof result === "object" && "raw" in result && typeof result.raw === "string") {
      try {
        const parsed = robustParseJSON(result.raw);
        if (parsed && typeof parsed === "object") {
          displayResult = parsed;
        }
      } catch {}
    }

    // Custom formatting helper
    const hasSummary = "summary" in displayResult;
    const hasEmail = "subject" in displayResult && "body" in displayResult;
    const hasResultField = "result" in displayResult;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="size-4 text-accent animate-pulse" />
            AI Execution Result
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              className="text-xs text-muted-foreground hover:text-foreground border-glass-border hover:bg-muted/50 h-8 flex items-center gap-1 cursor-pointer"
              onClick={downloadResponse}
            >
              <Download className="size-3.5" />
              Download Response
            </Button>
            <Button
              size="sm"
              type="button"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 flex items-center gap-1 cursor-pointer"
              onClick={() => handleCopy(JSON.stringify(displayResult, null, 2))}
            >
              {copied ? <Check className="size-3.5 mr-1" /> : <Clipboard className="size-3.5 mr-1" />}
              Copy JSON
            </Button>
          </div>
        </div>

        {/* Dynamic Display Formatting (with stripped raw markdown markers for professional view) */}
        {hasSummary && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
              <div className="text-xs font-bold text-accent uppercase flex items-center gap-1">
                <FileText className="size-3.5" />
                Executive Summary
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{stripMarkdown(displayResult.summary)}</p>
            </div>

            {displayResult.keyTakeaways && displayResult.keyTakeaways.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-foreground uppercase">Key Takeaways</div>
                <ul className="space-y-1.5">
                  {displayResult.keyTakeaways.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{stripMarkdown(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayResult.actionItems && displayResult.actionItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-foreground uppercase">Action Items</div>
                <ul className="space-y-2">
                  {displayResult.actionItems.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-glass-border">
                      <input type="checkbox" className="mt-0.5 rounded border-glass-border bg-transparent text-accent focus:ring-0 cursor-pointer" />
                      <span className="text-xs text-foreground/80">{stripMarkdown(item)}</span>
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
              <div className="bg-muted/40 px-4 py-3 border-b border-glass-border flex items-center gap-2 text-xs">
                <Mail className="size-3.5 text-accent" />
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-semibold text-foreground">{stripMarkdown(displayResult.subject)}</span>
              </div>
              <div className="p-5 bg-muted/10 text-sm text-foreground leading-relaxed font-sans whitespace-pre-wrap">
                {stripMarkdown(displayResult.body)}
              </div>
            </div>
          </div>
        )}

        {hasResultField && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
              <div className="text-xs font-bold text-accent uppercase flex items-center gap-1">
                <FileCheck className="size-3.5" />
                Operations Task Output
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{stripMarkdown(displayResult.result)}</p>
            </div>

            {displayResult.extractedData && Object.keys(displayResult.extractedData).length > 0 && (
              <div className="p-4 rounded-xl bg-muted/15 border border-glass-border space-y-3">
                <div className="text-xs font-bold text-foreground uppercase">Extracted Key Metrics</div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(displayResult.extractedData).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-3 rounded-lg bg-muted/30 border border-glass-border">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{key.replace(/([A-Z])/g, " $1")}</div>
                      <div className="text-sm font-semibold text-foreground mt-1">{val !== null ? stripMarkdown(String(val)) : <span className="text-muted-foreground font-normal italic">N/A</span>}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catch-all human-readable viewer if none of the above formats match */}
        {!hasSummary && !hasEmail && !hasResultField && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
              <div className="text-xs font-bold text-accent uppercase flex items-center gap-1">
                <FileText className="size-3.5" />
                Response Content
              </div>
              <div className="space-y-4">
                {typeof displayResult === "string" ? (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{stripMarkdown(displayResult)}</p>
                ) : displayResult && typeof displayResult === "object" && "raw" in displayResult ? (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{stripMarkdown((displayResult as any).raw)}</p>
                ) : displayResult && typeof displayResult === "object" ? (
                  Object.entries(displayResult).map(([key, val]) => {
                    const displayKey = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={key} className="space-y-1">
                        <div className="text-xs font-bold text-foreground uppercase tracking-wider">{displayKey}</div>
                        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap bg-muted/10 p-3 rounded-lg border border-glass-border">
                          {typeof val === "object" ? JSON.stringify(val, null, 2) : stripMarkdown(String(val))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{String(displayResult)}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleRun} className="space-y-4">
        <div className="space-y-2 p-4 rounded-xl border border-glass-border bg-muted/20">
          <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
            <Paperclip className="size-3.5 text-accent" />
            Attach Document (PDF, CSV, XML, TXT, DOCX, Invoices, transcripts, meeting notes)
          </Label>
          <p className="text-[10px] text-muted-foreground">
            Note: Scanned or image-only PDFs do not contain selectable text and cannot be parsed directly. Please upload digital-text PDFs or copy-paste text below.
          </p>
          {fileUrl ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <span className="text-xs font-semibold truncate max-w-[250px]">{fileName}</span>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => {
                  setFileUrl("");
                  setFileName("");
                }}
                className="text-xs text-emerald-500 hover:text-emerald-400 hover:bg-transparent cursor-pointer"
              >
                Remove
              </Button>
            </div>
          ) : (
            <FileUploader
              onUploadSuccess={(url) => {
                setFileUrl(url);
                const name = url.split("/").pop() || "Uploaded Document";
                setFileName(name);
              }}
              onUploadError={(err) => {
                console.error(err);
              }}
              folder="/business-docs"
              accept=".pdf,.xml,.csv,.txt,.json,.docx,.doc"
              label="Upload PDF, CSV, XML, TXT, or Word Document"
              isImage={false}
            />
          )}
        </div>

        {Object.entries(inputSchema).map(([key, field]) => {
          const isTextArea = field.type === "longtext";
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-xs font-semibold text-foreground/80">
                {field.label}
              </Label>
              {isTextArea ? (
                <textarea
                  id={key}
                  required={!fileUrl} // If file is uploaded, text fields are optional!
                  placeholder={fileUrl ? `${field.placeholder} (Optional, file contents will be used)` : field.placeholder}
                  value={inputs[key] || ""}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="w-full min-h-[140px] rounded-xl glass border border-glass-border bg-transparent p-4 text-sm text-foreground focus:border-accent outline-none placeholder:text-muted-foreground/60 leading-relaxed"
                />
              ) : (
                <Input
                  id={key}
                  required={!fileUrl && key !== "targetLength" && key !== "tone" && key !== "task"} // target options can be optional
                  placeholder={field.placeholder}
                  value={inputs[key] || ""}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="h-12 rounded-xl glass border-glass-border focus:border-accent text-foreground"
                />
              )}
            </div>
          );
        })}

        <Button
          type="submit"
          disabled={isLoading}
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
        <div className="p-5 rounded-2xl bg-muted/20 border border-glass-border">
          {renderResultData()}
        </div>
      )}
    </div>
  );
}
