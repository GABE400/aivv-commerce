"use client";

import { useEffect, useState, useTransition } from "react";
import { getSupplierPaymentsAction, getRealtimeSupplierStatusAction } from "@/lib/actions/fulfillment";
import { format } from "date-fns";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupplierItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  supplierOrderId: string | null;
  order: {
    id: string;
    createdAt: Date;
    paymentStatus: string;
    user: {
      name: string;
      email: string;
    };
  };
  variant: {
    name: string;
    product: {
      name: string;
      type: string;
    };
  };
}

export default function SupplierPaymentsPage() {
  const [items, setItems] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, { status: string; isPaid: boolean; error?: string; loading: boolean }>>({});
  const [isPending, startTransition] = useTransition();

  const fetchItems = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const data = await getSupplierPaymentsAction() as any[];
        setItems(data);
        // Initialize loading statuses for each supplier order
        const initialStatuses: typeof statuses = {};
        data.forEach(item => {
          if (item.supplierOrderId) {
            initialStatuses[item.id] = { status: "Awaiting Check", isPaid: false, loading: true };
          }
        });
        setStatuses(initialStatuses);

        // Fetch each status in real-time
        data.forEach(item => {
          if (item.supplierOrderId) {
            fetchRealtimeStatus(item.id, item.variant.product.type, item.supplierOrderId);
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  };

  const fetchRealtimeStatus = async (itemId: string, productType: string, supplierOrderId: string) => {
    setStatuses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], loading: true }
    }));

    try {
      const type = productType === "pod" ? "pod" : "dropship";
      const result = await getRealtimeSupplierStatusAction(type, supplierOrderId);
      if (result.success) {
        setStatuses(prev => ({
          ...prev,
          [itemId]: { status: result.status || "Unknown", isPaid: !!result.isPaid, loading: false }
        }));
      } else {
        setStatuses(prev => ({
          ...prev,
          [itemId]: { status: "Failed", isPaid: false, error: result.error || "API Error", loading: false }
        }));
      }
    } catch (err: any) {
      setStatuses(prev => ({
        ...prev,
        [itemId]: { status: "Error", isPaid: false, error: err.message || "Connection Error", loading: false }
      }));
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Accounting</h2>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="size-8 text-accent" />
            Supplier Payments Ledger
          </h1>
        </div>
        <Button 
          onClick={fetchItems} 
          disabled={loading || isPending}
          className="rounded-xl font-bold accent-gradient text-white flex items-center gap-2"
        >
          <RefreshCw className={`size-4 ${loading || isPending ? "animate-spin" : ""}`} />
          Refresh Ledger
        </Button>
      </div>

      <div className="rounded-2xl border border-glass-border glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-glass-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Local Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Item / Product</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Supplier & Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Retail Paid</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Wholesale Paid (Real-time)</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="size-8 animate-spin text-accent" />
                      <p className="text-sm text-muted-foreground font-medium">Fetching supplier transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => {
                  const status = statuses[item.id];
                  const isPod = item.variant.product.type === "pod";
                  const supplierName = isPod ? "On-Demand Print" : "Direct Sourcing";
                  
                  return (
                    <tr key={item.id} className="hover:bg-glass-highlight transition-colors">
                      {/* Local Order */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground" title={item.order.id}>
                          #{item.order.id.substring(0, 8)}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {format(new Date(item.order.createdAt), "MMM d, yyyy")}
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs">{item.variant.product.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                          {item.variant.name} • Qty {item.quantity}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold">{item.order.user.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{item.order.user.email}</div>
                      </td>

                      {/* Supplier ID */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${isPod ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                          {supplierName}
                        </span>
                        <div className="font-mono text-[10px] font-bold text-muted-foreground mt-1" title={item.supplierOrderId || ""}>
                          #{item.supplierOrderId ? item.supplierOrderId.substring(0, 15) : "N/A"}
                          {item.supplierOrderId && item.supplierOrderId.length > 15 ? "..." : ""}
                        </div>
                      </td>

                      {/* Retail Payment status */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-xs">${parseFloat(item.price).toFixed(2)}</span>
                        <div className="text-[9px] font-bold uppercase text-emerald-500 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="size-2.5" />
                          {item.order.paymentStatus}
                        </div>
                      </td>

                      {/* Real-time wholesale status */}
                      <td className="px-6 py-4">
                        {status?.loading ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                            <Loader2 className="size-3.5 animate-spin text-accent" />
                            Checking...
                          </div>
                        ) : status?.error ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold">
                              <AlertCircle className="size-3" />
                              Error
                            </span>
                            <div className="text-[9px] text-red-400 mt-0.5 truncate max-w-[120px]">{status.error}</div>
                          </div>
                        ) : (
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              status?.isPaid 
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" 
                                : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                            }`}>
                              {status?.isPaid ? <CheckCircle className="size-3" /> : <XCircle className="size-3" />}
                              {status?.isPaid ? "Paid to Supplier" : "Unpaid / Pending"}
                            </span>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                              Status: <span className="font-semibold text-foreground">{status?.status}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        {item.supplierOrderId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={status?.loading}
                            onClick={() => fetchRealtimeStatus(item.id, item.variant.product.type, item.supplierOrderId!)}
                            className="size-8 rounded-lg hover:bg-accent/10 hover:text-accent disabled:opacity-30"
                          >
                            <RefreshCw className={`size-3.5 ${status?.loading ? "animate-spin" : ""}`} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                    No active supplier fulfillment orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
