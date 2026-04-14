"use client";

import { DataTable } from "@/components/ui/data-table";

interface RecentOrdersTableProps {
  data: any[];
}

export function RecentOrdersTable({ data }: RecentOrdersTableProps) {
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
      header: "Customer",
      accessorKey: "user",
      cell: (row: any) => <span>{row.user?.name || "Guest"}</span>,
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
      header: "Amount",
      accessorKey: "totalAmount",
      cell: (row: any) => (
        <span className="font-bold">${parseFloat(row.totalAmount).toFixed(2)}</span>
      ),
    },
  ];

  return (
    <DataTable 
      columns={columns}
      data={data}
    />
  );
}
