"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { 
  User, 
  MapPin, 
  Truck, 
  ExternalLink, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Eye,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { manualFulfillOrderAction } from "@/lib/actions/fulfillment";

interface OrdersClientProps {
  initialOrders: any[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleForceFulfill = (orderId: string) => {
    startTransition(async () => {
      try {
        const res = await manualFulfillOrderAction(orderId);
        if (res.success) {
          toast.success(res.message || "Fulfillment triggered successfully.");
          router.refresh();
          // Update selected order in state if it's open
          if (selectedOrder && selectedOrder.id === orderId) {
            // Find updated order from list or just close dialog and let refresh handle it
            setSelectedOrder(null);
          }
        } else {
          toast.error(res.error || "Fulfillment trigger failed.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred during fulfillment.");
      }
    });
  };

  const getFulfillmentBadgeColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "pending":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground border-glass-border";
    }
  };

  const getProductTypeBadgeColor = (type: string) => {
    switch (type) {
      case "pod":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      case "dropship":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "digital":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass border border-glass-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-glass-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4">Total</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/40 text-sm">
              {initialOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                initialOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-muted-foreground uppercase">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-foreground">{order.user.name}</div>
                        <div className="text-xs text-muted-foreground">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-medium">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                        order.paymentStatus === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        order.paymentStatus === "failed" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-muted text-muted-foreground border-glass-border"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                        order.status === "fulfilled" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        order.status === "processing" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-muted text-muted-foreground border-glass-border"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="gap-1 rounded-xl glass border-glass-border hover:bg-glass-highlight text-xs font-bold"
                      >
                        <Eye className="size-3.5" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Inspector Modal */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="max-w-2xl glass border border-glass-border text-foreground rounded-3xl p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Package className="size-5 text-accent" />
                    Order Details
                  </DialogTitle>
                  <DialogDescription className="text-xs font-mono text-muted-foreground uppercase pt-1">
                    ID: #{selectedOrder.id}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getFulfillmentBadgeColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <Separator className="bg-glass-border" />

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6 py-2">
                {/* Customer & Shipping Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="size-3.5 text-accent" />
                      Customer Details
                    </h3>
                    <div className="p-3 rounded-xl bg-muted/20 border border-glass-border/30">
                      <div className="font-bold">{selectedOrder.user.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{selectedOrder.user.email}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-accent" />
                      Shipping Address
                    </h3>
                    <div className="p-3 rounded-xl bg-muted/20 border border-glass-border/30 text-xs space-y-1">
                      {selectedOrder.shippingAddress ? (() => {
                        try {
                          const addr = JSON.parse(selectedOrder.shippingAddress);
                          return (
                            <>
                              <div className="font-bold text-sm text-foreground">
                                {addr.firstName} {addr.lastName}
                              </div>
                              <div>{addr.line1}</div>
                              {addr.line2 && <div>{addr.line2}</div>}
                              <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                              <div className="font-semibold text-muted-foreground uppercase">{addr.country}</div>
                              {addr.phone && <div className="text-muted-foreground mt-1">Phone: {addr.phone}</div>}
                            </>
                          );
                        } catch (e) {
                          return <div className="text-muted-foreground break-all">{selectedOrder.shippingAddress}</div>;
                        }
                      })() : (
                        <div className="text-muted-foreground italic">No shipping address recorded (likely a digital purchase).</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="size-3.5 text-accent" />
                    Line Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any) => {
                      const prodType = item.variant.product.type;
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl bg-muted/10 border border-glass-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground">{item.variant.product.name}</span>
                              <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 py-0 ${getProductTypeBadgeColor(prodType)}`}>
                                {prodType}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                              Variant: {item.variant.name} • SKU: {item.variant.sku}
                            </div>
                            
                            {/* Supplier details if applicable */}
                            {(item.supplierOrderId || item.trackingNumber) && (
                              <div className="mt-2 text-xs p-2 rounded-lg bg-muted/30 border border-glass-border/20 space-y-1 font-mono">
                                {item.supplierOrderId && (
                                  <div>
                                    <span className="text-muted-foreground">Supplier ID:</span>{" "}
                                    <span className="font-bold text-foreground">{item.supplierOrderId}</span>
                                  </div>
                                )}
                                {item.trackingNumber && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">Tracking:</span>{" "}
                                    <span className="font-bold text-accent">{item.trackingNumber}</span>
                                    <Truck className="size-3.5 text-accent" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-6 justify-between md:justify-end">
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              Qty: <span className="font-bold text-foreground">{item.quantity}</span>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              Price: <span className="font-bold text-foreground">${parseFloat(item.price).toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={`uppercase text-[10px] font-bold ${getFulfillmentBadgeColor(item.fulfillmentStatus)}`}>
                                {item.fulfillmentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total amount details */}
                <div className="p-4 rounded-xl bg-muted/20 border border-glass-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Total</span>
                  </div>
                  <div className="text-xl font-bold text-accent">
                    ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <Separator className="bg-glass-border mt-4" />

            <DialogFooter className="mt-4 flex sm:justify-between items-center w-full gap-4">
              <div className="text-xs text-muted-foreground text-left flex-1">
                {selectedOrder.status !== "fulfilled" && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-amber-500 animate-pulse" />
                    This order is pending fulfillment.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-transparent hover:bg-glass-highlight"
                >
                  Close
                </Button>
                {selectedOrder.status !== "fulfilled" && (
                  <Button
                    onClick={() => handleForceFulfill(selectedOrder.id)}
                    disabled={isPending}
                    className="accent-gradient text-white font-bold gap-2 rounded-xl shadow-lg shadow-accent/20"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Truck className="size-4" />
                    )}
                    Force Fulfill
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
