"use client";

import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrdersTableProps {
  orders: any[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const columns = [
    {
      header: "Order ID",
      accessorKey: "id",
      cell: (row: any) => (
        <span className="font-mono text-[10px] font-bold text-muted-foreground">
          #{row.id.substring(0, 8)}
        </span>
      ),
    },
    {
      header: "Items",
      accessorKey: "items",
      cell: (row: any) => (
        <div className="text-xs truncate max-w-[200px]">
          {row.items.map((i: any) => i.variant.product.name).join(", ")}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <span className="px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent text-[10px] uppercase font-bold">
          {row.status}
        </span>
      ),
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: (row: any) => (
        <span className="font-bold">${parseFloat(row.totalAmount).toFixed(2)}</span>
      ),
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (row: any) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
  ];

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl glass border border-glass-border p-12 text-center text-muted-foreground italic">
        <ShoppingBag className="size-12 mx-auto mb-4 opacity-20" />
        <p>You haven't made any purchases yet. Start shopping to build your commerce history!</p>
        <Link href="/">
          <Button className="mt-6 font-bold accent-gradient text-white">
            Browse Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DataTable 
      columns={columns}
      data={orders}
    />
  );
}
