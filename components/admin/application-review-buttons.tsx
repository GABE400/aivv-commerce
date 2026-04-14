"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reviewApplicationAction } from "@/lib/actions/applications";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApplicationReviewButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"approving" | "rejecting" | null>(null);

  const handleReview = async (status: "approved" | "rejected") => {
    setIsLoading(status === "approved" ? "approving" : "rejecting");
    try {
      const result = await reviewApplicationAction(applicationId, status);
      if (result.success) {
        toast.success(`Application ${status} successfully!`);
        router.refresh();
      } else {
        toast.error(result.error || "Review failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="size-8 h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
        onClick={() => handleReview("approved")}
        disabled={isLoading !== null}
      >
        {isLoading === "approving" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        )}
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="size-8 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
        onClick={() => handleReview("rejected")}
        disabled={isLoading !== null}
      >
        {isLoading === "rejecting" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <X className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
