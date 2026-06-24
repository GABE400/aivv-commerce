"use client";

import { useState, useTransition } from "react";
import { updateWorkflowConfigAction } from "@/lib/actions/ai";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserWorkflowConfig } from "@/lib/ai/types";

interface PipedreamIntegrationProps {
  workflowId: string;
  initialConfigStr?: string | null;
}

export function PipedreamIntegration({ workflowId, initialConfigStr }: PipedreamIntegrationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Parse initial config
  let initialConfig: UserWorkflowConfig = {};
  if (initialConfigStr) {
    try {
      initialConfig = JSON.parse(initialConfigStr);
    } catch (e) {
      console.error("Failed to parse initial workflow config", e);
    }
  }

  const [webhookUrl, setWebhookUrl] = useState(initialConfig.pipedreamWebhookUrl || "");
  const [enabled, setEnabled] = useState(!!initialConfig.enablePipedream);

  const handleSave = () => {
    // Validate if enabled but URL is empty
    if (enabled && !webhookUrl) {
      toast.error("Please provide a valid Webhook URL to enable the integration.");
      return;
    }

    if (webhookUrl && !webhookUrl.startsWith("http://") && !webhookUrl.startsWith("https://")) {
      toast.error("Webhook URL must start with http:// or https://");
      return;
    }

    startTransition(async () => {
      try {
        const configObj: UserWorkflowConfig = {
          pipedreamWebhookUrl: webhookUrl.trim(),
          enablePipedream: enabled,
        };
        const configStr = JSON.stringify(configObj);
        
        const result = await updateWorkflowConfigAction(workflowId, configStr);
        if (result.success) {
          toast.success("Pipedream integration settings saved!");
          router.refresh();
        } else {
          toast.error("Failed to save integration settings.");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update integration settings.");
      }
    });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-glass-border">
      <div className="flex items-center gap-2">
        <Share2 className="size-4 text-accent" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Pipedream Dispatcher</h4>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="pipedream-url" className="text-xs text-muted-foreground font-semibold">
          Pipedream Webhook URL
        </Label>
        <Input
          id="pipedream-url"
          type="text"
          placeholder="https://eo...m.pipedream.net"
          value={webhookUrl}
          disabled={isPending}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="h-10 text-xs w-full bg-glass border-glass-border focus-visible:ring-0 text-foreground placeholder:opacity-50"
        />
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="pipedream-enable"
          checked={enabled}
          disabled={isPending}
          onCheckedChange={(checked) => setEnabled(!!checked)}
          className="border-glass-border data-[state=checked]:bg-accent data-[state=checked]:text-white"
        />
        <Label
          htmlFor="pipedream-enable"
          className="text-xs font-medium leading-none text-muted-foreground select-none cursor-pointer"
        >
          Enable Pipedream Trigger
        </Label>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="w-full h-9 text-xs font-bold accent-gradient text-white rounded-xl shadow-md shadow-accent/15"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          "Save Integration"
        )}
      </Button>
    </div>
  );
}
