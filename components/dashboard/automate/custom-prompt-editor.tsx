"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateWorkflowCustomPrompt } from "@/lib/actions/ai";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface CustomPromptEditorProps {
  workflowId: string;
  initialCustomPrompt: string | null;
}

export function CustomPromptEditor({ workflowId, initialCustomPrompt }: CustomPromptEditorProps) {
  const [customPrompt, setCustomPrompt] = useState(initialCustomPrompt || "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateWorkflowCustomPrompt(workflowId, customPrompt.trim() || null);
        if (result.success) {
          toast.success("Workflow instructions updated successfully!");
        } else {
          toast.error("Failed to update instructions.");
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred while saving instructions.");
      }
    });
  };

  return (
    <div className="space-y-3 pt-3 border-t border-glass-border">
      <div className="space-y-1">
        <Label htmlFor="customPrompt" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          System Instructions Override
        </Label>
        <p className="text-[10px] text-muted-foreground leading-normal">
          Provide custom rules or guidelines (e.g., "Use bullet points only", "Write in French") to supplement this workflow.
        </p>
      </div>
      <textarea
        id="customPrompt"
        disabled={isPending}
        placeholder="e.g. Always write responses in Spanish and keep the tone professional..."
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        className="w-full min-h-[90px] rounded-xl glass border border-glass-border bg-transparent p-3 text-xs text-foreground focus:border-accent outline-none placeholder:text-muted-foreground/60 leading-relaxed resize-y"
      />
      <Button
        size="sm"
        disabled={isPending}
        onClick={handleSave}
        className="w-full text-xs h-9 bg-accent hover:bg-accent-hover text-white flex items-center justify-center gap-1.5 cursor-pointer rounded-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="size-3 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="size-3" />
            Save Instructions
          </>
        )}
      </Button>
    </div>
  );
}
