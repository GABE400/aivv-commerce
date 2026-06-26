"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { syncCJDropshippingCatalogAction } from "@/lib/actions/cj-sync";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SyncState = "idle" | "syncing" | "done" | "error";

export function CjSyncButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>("idle");

  const handleSync = async () => {
    setState("syncing");
    const toastId = toast.loading("Syncing CJ Dropshipping catalog…");

    try {
      const result = await syncCJDropshippingCatalogAction();

      if (result.success) {
        toast.success(result.message, { id: toastId });
        setState("done");
        router.refresh();
        setTimeout(() => setState("idle"), 3000);
      } else {
        const msg = result.error || "Sync failed";
        if (msg.toLowerCase().includes("not connected")) {
          toast.error(
            "CJ account not connected — connect it in the Business settings first.",
            { id: toastId }
          );
        } else {
          toast.error(msg, { id: toastId });
        }
        setState("error");
        setTimeout(() => setState("idle"), 4000);
      }
    } catch (error: any) {
      toast.error(
        error?.message?.includes("not connected")
          ? "CJ account not connected — connect it in the Business settings first."
          : "Something went wrong during synchronization",
        { id: toastId }
      );
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  };

  const icons: Record<SyncState, React.ReactNode> = {
    idle: <RefreshCw className="size-4" />,
    syncing: <Loader2 className="size-4 animate-spin" />,
    done: <CheckCircle2 className="size-4 text-emerald-500" />,
    error: <AlertCircle className="size-4 text-red-500" />,
  };

  const labels: Record<SyncState, string> = {
    idle: "Sync CJ Dropshipping",
    syncing: "Syncing…",
    done: "Synced!",
    error: "Sync Failed",
  };

  return (
    <Button
      variant="outline"
      disabled={state === "syncing"}
      onClick={handleSync}
      className="gap-2 font-bold glass border-glass-border hover:bg-glass-highlight"
    >
      {icons[state]}
      {labels[state]}
    </Button>
  );
}
