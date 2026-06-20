"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncCJDropshippingCatalogAction } from "@/lib/actions/cj-sync";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CjSyncButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncCJDropshippingCatalogAction();
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error || "Sync failed");
      }
    } catch (error) {
      toast.error("Something went wrong during synchronization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      disabled={isLoading} 
      onClick={handleSync}
      className="gap-2 font-bold glass border-glass-border hover:bg-glass-highlight"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw className="size-4" />
      )}
      Sync with CJ Dropshipping
    </Button>
  );
}
