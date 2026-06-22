"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  ExternalLink, 
  Copy, 
  X,
  FileJson,
  Download,
  Paperclip
} from "lucide-react";
import { toast } from "sonner";

interface ExecutionLog {
  id: string;
  userWorkflowId: string;
  status: string;
  input: string | null;
  output: string | null;
  error: string | null;
  tokensUsed: number | null;
  durationMs: number | null;
  createdAt: Date;
  workflowName: string | null;
  model: string | null;
}

interface HistoryClientProps {
  initialExecutions: ExecutionLog[];
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

export default function HistoryClient({ initialExecutions }: HistoryClientProps) {
  const [selected, setSelected] = useState<ExecutionLog | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Output copied to clipboard!");
  };

  const downloadResponse = (log: ExecutionLog) => {
    if (!log.output) return;
    let textToDownload = "";

    try {
      const parsed = JSON.parse(log.output);
      
      if (parsed.summary) {
        textToDownload += `SUMMARY:\n${stripMarkdown(parsed.summary)}\n\n`;
        if (parsed.keyTakeaways && parsed.keyTakeaways.length > 0) {
          textToDownload += `KEY TAKEAWAYS:\n${parsed.keyTakeaways.map((k: string) => `• ${stripMarkdown(k)}`).join("\n")}\n\n`;
        }
        if (parsed.actionItems && parsed.actionItems.length > 0) {
          textToDownload += `ACTION ITEMS:\n${parsed.actionItems.map((a: string) => `[ ] ${stripMarkdown(a)}`).join("\n")}\n`;
        }
      } else if (parsed.subject && parsed.body) {
        textToDownload += `SUBJECT: ${stripMarkdown(parsed.subject)}\n\n${stripMarkdown(parsed.body)}`;
      } else if (parsed.result) {
        textToDownload += stripMarkdown(parsed.result);
      } else if (parsed.raw) {
        textToDownload += stripMarkdown(parsed.raw);
      } else {
        textToDownload += JSON.stringify(parsed, null, 2);
      }
    } catch {
      textToDownload += stripMarkdown(log.output);
    }

    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aivv-log-response-${log.id.substring(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("AI Response downloaded to your computer!");
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return "-";
    return (ms / 1000).toFixed(2) + "s";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1 w-fit">
            <CheckCircle2 className="size-3" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1 w-fit">
            <XCircle className="size-3" />
            Failed
          </Badge>
        );
      case "running":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1 w-fit animate-pulse">
            <Clock className="size-3 animate-spin" />
            Running
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {initialExecutions.length === 0 ? (
        <Card className="glass border-glass-border">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="p-4 bg-muted/10 rounded-full border border-glass-border">
              <FileJson className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Executions Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your workflow execution logs will appear here once you activate and run your automation tasks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-glass-border rounded-2xl overflow-hidden glass bg-[#11162d]/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-[#1A1F35]/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4 pl-6">Workflow</th>
                  <th className="p-4">Model</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Latency</th>
                  <th className="p-4">Tokens</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border text-sm">
                {initialExecutions.map((log) => {
                  let hasAttachment = false;
                  try {
                    const parsedInput = log.input ? JSON.parse(log.input) : {};
                    hasAttachment = !!parsedInput.fileUrl;
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 font-semibold text-white flex items-center gap-2">
                        {log.workflowName || "Unknown Workflow"}
                        {hasAttachment && (
                          <span title="Has attached document">
                            <Paperclip className="size-3.5 text-accent" />
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                        {log.model || "None"}
                      </td>
                      <td className="p-4">{getStatusBadge(log.status)}</td>
                      <td className="p-4 text-muted-foreground">{formatDuration(log.durationMs)}</td>
                      <td className="p-4 text-muted-foreground">{log.tokensUsed ?? "-"}</td>
                      <td className="p-4 text-xs text-muted-foreground">{formatDate(log.createdAt)}</td>
                      <td className="p-4 pr-6 text-right">
                        <Button
                          onClick={() => setSelected(log)}
                          size="sm"
                          variant="secondary"
                          className="bg-muted/10 hover:bg-muted/20 border border-glass-border text-white text-xs h-8 px-3 rounded-lg cursor-pointer"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f1329] border border-glass-border w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-glass-border flex justify-between items-center bg-[#151a37]/50">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  Inspect Log Run
                  {getStatusBadge(selected.status)}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{selected.id}</p>
              </div>
              <Button
                onClick={() => setSelected(null)}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10 rounded-full h-8 w-8 p-0"
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-muted-foreground">
              {/* Error Box if Failed */}
              {selected.status === "failed" && selected.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2">
                  <XCircle className="size-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider mb-1">Execution Error</div>
                    <div className="font-mono text-xs">{selected.error}</div>
                  </div>
                </div>
              )}

              {/* Run Metrics */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/5 border border-glass-border/40">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Provider/Model</div>
                  <div className="text-xs font-semibold text-white truncate">{selected.model || "None"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Latency</div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <Clock className="size-3 text-accent" />
                    {formatDuration(selected.durationMs)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Tokens Used</div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <Cpu className="size-3 text-accent" />
                    {selected.tokensUsed ?? "0"}
                  </div>
                </div>
              </div>

              {/* Attached Document Section */}
              {(() => {
                try {
                  const parsedInput = selected.input ? JSON.parse(selected.input) : {};
                  if (parsedInput.fileUrl) {
                    return (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-white uppercase tracking-wider">Attached Document</div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-white/5">
                          <div className="flex items-center gap-2 text-sm text-gray-200 truncate">
                            <Paperclip className="size-4 text-accent" />
                            <span className="truncate max-w-[300px]">{parsedInput.fileName || "Uploaded File"}</span>
                          </div>
                          <a
                            href={parsedInput.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-bold px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 cursor-pointer"
                          >
                            <ExternalLink className="size-3" />
                            Open Document
                          </a>
                        </div>
                      </div>
                    );
                  }
                } catch {
                  return null;
                }
                return null;
              })()}

              {/* Input Parameters */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Input Parameters</div>
                <pre className="p-4 rounded-xl border border-glass-border bg-black/30 font-mono text-xs overflow-x-auto text-muted-foreground">
                  {JSON.stringify(selected.input ? JSON.parse(selected.input) : {}, null, 2)}
                </pre>
              </div>

              {/* Generated Response */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Generated Response</div>
                  {selected.output && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => downloadResponse(selected)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2 hover:bg-white/5 flex items-center gap-1 border-glass-border cursor-pointer text-muted-foreground hover:text-white"
                      >
                        <Download className="size-3" />
                        Download Response
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(
                          (() => {
                            try {
                              const parsed = JSON.parse(selected.output!);
                              if (parsed.raw) return parsed.raw;
                              return JSON.stringify(parsed, null, 2);
                            } catch {
                              return selected.output!;
                            }
                          })()
                        )}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2 hover:bg-white/5 flex items-center gap-1"
                      >
                        <Copy className="size-3" />
                        Copy Output
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-4 rounded-xl border border-glass-border bg-black/30 font-mono text-xs overflow-x-auto text-white min-h-[100px] whitespace-pre-wrap">
                  {selected.output ? (
                    (() => {
                      try {
                        const parsed = JSON.parse(selected.output);
                        
                        // Render formatted with stripped markdown to be highly professional without raw # ** markers
                        if (parsed.summary) {
                          return (
                            <div className="space-y-3 font-sans text-sm text-gray-300">
                              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-white whitespace-pre-wrap">{stripMarkdown(parsed.summary)}</div>
                              {parsed.keyTakeaways && parsed.keyTakeaways.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-bold text-white uppercase">Key Takeaways</div>
                                  <ul className="space-y-1">
                                    {parsed.keyTakeaways.map((k: string, i: number) => <li key={i} className="text-xs text-muted-foreground">• {stripMarkdown(k)}</li>)}
                                  </ul>
                                </div>
                              )}
                              {parsed.actionItems && parsed.actionItems.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-bold text-white uppercase">Action Items</div>
                                  <ul className="space-y-1">
                                    {parsed.actionItems.map((a: string, i: number) => <li key={i} className="text-xs text-gray-300">[ ] {stripMarkdown(a)}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (parsed.subject && parsed.body) {
                          return (
                            <div className="space-y-2 font-sans text-sm text-gray-300">
                              <div className="font-bold text-white">Subject: {stripMarkdown(parsed.subject)}</div>
                              <div className="p-3 rounded-lg bg-white/5 border border-glass-border whitespace-pre-wrap">{stripMarkdown(parsed.body)}</div>
                            </div>
                          );
                        }
                        if (parsed.result) {
                          return <div className="font-sans text-sm text-gray-300 whitespace-pre-wrap">{stripMarkdown(parsed.result)}</div>;
                        }

                        if (parsed.raw) return stripMarkdown(parsed.raw);
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return stripMarkdown(selected.output);
                      }
                    })()
                  ) : (
                    <span className="text-muted-foreground italic">No output produced.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-glass-border bg-[#151a37]/50 flex justify-end">
              <Button
                onClick={() => setSelected(null)}
                variant="secondary"
                size="sm"
                className="bg-muted/10 hover:bg-white/5 text-white cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
