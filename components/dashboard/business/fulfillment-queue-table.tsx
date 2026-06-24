"use client";

import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FulfillmentButton } from "./fulfillment-button";

interface FulfillmentQueueTableProps {
  items: any[];
}

export function FulfillmentQueueTable({ items }: FulfillmentQueueTableProps) {
  const columns = [
    {
      header: "Order / Item",
      accessorKey: "id",
      cell: (row: any) => (
        <div>
          <div className="font-bold">{row.variant.product.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {row.variant.name} • #{row.order.id.substring(0, 8)}
          </div>
        </div>
      ),
    },
    {
      header: "Qty",
      accessorKey: "quantity",
      cell: (row: any) => <span className="font-bold">{row.quantity}</span>,
    },
    {
      header: "Fulfillment Status",
      accessorKey: "fulfillmentStatus",
      cell: (row: any) => (
        <span className={cn(
          "px-2 py-1 rounded text-[10px] uppercase font-bold",
          row.fulfillmentStatus === "delivered" ? "bg-emerald-500/10 text-emerald-500" :
          row.fulfillmentStatus === "pending" ? "bg-amber-500/10 text-amber-500" :
          "bg-blue-500/10 text-blue-500"
        )}>
          {row.fulfillmentStatus}
        </span>
      ),
    },
    {
      header: "Tracking",
      accessorKey: "trackingNumber",
      cell: (row: any) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.trackingNumber || "No Tracking Yet"}
        </span>
      ),
    },
    {
      header: "Order Date",
      accessorKey: "order.createdAt",
      cell: (row: any) => (
        <div className="text-xs text-muted-foreground">
          {format(new Date(row.order.createdAt), "MMM d, h:mm a")}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: any) => (
        <FulfillmentButton itemId={row.id} currentStatus={row.fulfillmentStatus} />
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl glass border border-glass-border p-12 text-center text-muted-foreground italic">
        <p>You have no active fulfillment jobs assigned to your business profile at this moment.</p>
        <p className="text-xs mt-2">New orders will appear here automatically based on product mappings.</p>
      </div>
    );
  }

  return (
    <DataTable 
      columns={columns}
      data={items}
    />
  );
}
