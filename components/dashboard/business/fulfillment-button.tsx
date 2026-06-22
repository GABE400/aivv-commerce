"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFulfillmentAction } from "@/lib/actions/suppliers";
import { toast } from "sonner";
import { Truck, Loader2 } from "lucide-react";

export function FulfillmentButton({ itemId, currentStatus }: { itemId: string, currentStatus: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tracking, setTracking] = useState("");

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await updateFulfillmentAction(itemId, {
        status: "shipped",
        trackingNumber: tracking || undefined
      });
      
      if (result.success) {
        toast.success("Order marked as shipped!");
        setIsOpen(false);
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === "delivered" || currentStatus === "shipped") {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2 text-emerald-500">
        <Truck className="size-3.5" />
        Filled
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 accent-gradient text-white border-0 shadow-sm">
          <Truck className="size-3.5" />
          Ship Item
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-glass-border">
        <DialogHeader>
          <DialogTitle>Mark as Shipped</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tracking Number (Optional)</Label>
            <Input 
              placeholder="Enter carrier tracking link or ID" 
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="glass border-glass-border"
            />
          </div>
          <Button 
            onClick={handleUpdate} 
            disabled={isLoading}
            className="w-full accent-gradient text-white font-bold"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Confirm Shipment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
