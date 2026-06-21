"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Eye, 
  Package, 
  Clock, 
  CreditCard, 
  MapPin, 
  Download, 
  Truck,
  ExternalLink,
  ShoppingBag
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
import Link from "next/link";

interface CustomerOrdersClientProps {
  initialOrders: any[];
}

export function CustomerOrdersClient({ initialOrders }: CustomerOrdersClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const getFulfillmentBadgeColor = (status: string) => {
    switch (status) {
      case "fulfilled":
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "processing":
      case "in_progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "pending":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
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
                  <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                    <div className="max-w-xs mx-auto space-y-4">
                      <ShoppingBag className="size-10 mx-auto opacity-20" />
                      <p>You haven't made any purchases yet.</p>
                      <Link href="/shop" className="inline-block">
                        <Button size="sm" className="accent-gradient text-white font-bold rounded-xl">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                initialOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-muted-foreground uppercase">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="p-4 text-xs font-medium max-w-[240px] truncate">
                      {order.items.map((i: any) => i.variant.product.name).join(", ")}
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
                        getFulfillmentBadgeColor(order.status)
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
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

      {/* Order Detail Dialog */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="max-w-2xl glass border border-glass-border text-foreground rounded-3xl p-6 shadow-2xl">
            <DialogHeader>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Package className="size-5 text-accent" />
                  Order Overview
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground uppercase pt-1">
                  ID: #{selectedOrder.id}
                </DialogDescription>
              </div>
            </DialogHeader>

            <Separator className="bg-glass-border" />

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6 py-2">
                {/* Shipping info */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-accent" />
                    Delivery / Shipping Destination
                  </h3>
                  <div className="p-4 rounded-xl bg-muted/20 border border-glass-border/30 text-xs space-y-1">
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
                      <div className="text-muted-foreground italic">No physical shipping address recorded (likely a digital item).</div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="size-3.5 text-accent" />
                    Purchased Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any) => {
                      const prodType = item.variant.product.type;
                      const hasAsset = !!item.variant.assetUrl;
                      const isPaid = selectedOrder.paymentStatus === "paid";
                      
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl bg-muted/10 border border-glass-border/20 flex flex-col justify-between gap-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-foreground">{item.variant.product.name}</span>
                                <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 py-0 ${getProductTypeBadgeColor(prodType)}`}>
                                  {prodType}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Variant: <span className="font-medium text-foreground">{item.variant.name}</span> • SKU: <span className="font-mono text-foreground">{item.variant.sku}</span>
                              </div>
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

                          {/* Tracking Number or Digital Asset Link */}
                          {(item.trackingNumber || (prodType === "digital" && hasAsset)) && (
                            <div className="mt-1 p-3 rounded-xl bg-muted/30 border border-glass-border/25 flex flex-col md:flex-row md:items-center justify-between gap-3">
                              {item.trackingNumber && (
                                <div className="flex items-center gap-2 text-xs font-mono">
                                  <Truck className="size-4 text-accent" />
                                  <span className="text-muted-foreground">Tracking Number:</span>
                                  <span className="font-bold text-foreground">{item.trackingNumber}</span>
                                </div>
                              )}
                              
                              {prodType === "digital" && hasAsset && (
                                <div className="w-full flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {isPaid ? "Digital file is ready for download:" : "File available after payment settles."}
                                  </span>
                                  {isPaid && (
                                    <a
                                      href={item.variant.assetUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs text-accent font-bold hover:underline"
                                    >
                                      <Download className="size-3.5" />
                                      Download File
                                      <ExternalLink className="size-3" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total amount details */}
                <div className="p-4 rounded-xl bg-muted/20 border border-glass-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Status ({selectedOrder.paymentStatus})</span>
                  </div>
                  <div className="text-xl font-bold text-accent">
                    ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <Separator className="bg-glass-border mt-4" />

            <DialogFooter className="mt-4 flex sm:justify-between items-center w-full gap-4">
              <div className="text-xs text-muted-foreground text-left flex-1 flex items-center gap-1">
                {selectedOrder.status !== "fulfilled" ? (
                  <>
                    <Clock className="size-3.5 text-amber-500 animate-pulse" />
                    Order processing.
                  </>
                ) : (
                  <>
                    <Truck className="size-3.5 text-emerald-500" />
                    Fulfilled.
                  </>
                )}
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-transparent hover:bg-glass-highlight font-bold"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
