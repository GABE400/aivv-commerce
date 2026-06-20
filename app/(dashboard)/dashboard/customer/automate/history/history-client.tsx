"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  ExternalLink, 
  Copy, 
  X,
  FileJson
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

export default function HistoryClient({ initialExecutions }: HistoryClientProps) {
  const [selected, setSelected] = useState<ExecutionLog | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Output copied to clipboard!");
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
                {initialExecutions.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 font-semibold text-white">
                      {log.workflowName || "Unknown Workflow"}
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
                        className="bg-muted/10 hover:bg-muted/20 border border-glass-border text-white text-xs h-8 px-3 rounded-lg"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
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

              {/* Input Parameters */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Input Parameters</div>
                <pre className="p-4 rounded-xl border border-glass-border bg-black/30 font-mono text-xs overflow-x-auto text-muted-foreground">
                  {JSON.stringify(selected.input ? JSON.parse(selected.input) : {}, null, 2)}
                </pre>
              </div>

              {/* Generated Output */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Generated Response</div>
                  {selected.output && (
                    <Button
                      onClick={() => copyToClipboard(
                        typeof JSON.parse(selected.output!).raw === "string" 
                          ? JSON.parse(selected.output!).raw 
                          : JSON.stringify(JSON.parse(selected.output!), null, 2)
                      )}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 hover:bg-white/5 flex items-center gap-1"
                    >
                      <Copy className="size-3" />
                      Copy Output
                    </Button>
                  )}
                </div>
                <div className="p-4 rounded-xl border border-glass-border bg-black/30 font-mono text-xs overflow-x-auto text-white min-h-[100px] whitespace-pre-wrap">
                  {selected.output ? (
                    (() => {
                      try {
                        const parsed = JSON.parse(selected.output);
                        if (parsed.raw) return parsed.raw;
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return selected.output;
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
                className="bg-muted/10 hover:bg-white/5 text-white"
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
