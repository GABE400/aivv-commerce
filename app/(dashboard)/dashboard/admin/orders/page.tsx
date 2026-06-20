import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default async function AdminOrdersPage() {
  const allOrders = await db.query.orders.findMany({
    with: {
      user: true,
      items: {
        with: {
          variant: {
            with: {
              product: true
            }
          }
        }
      }
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });

  const columns = [
    {
      header: "Order ID",
      accessorKey: "id",
      cell: (row: any) => (
        <div className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
          #{row.id.substring(0, 8)}
        </div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "user",
      cell: (row: any) => (
        <div>
          <div className="font-bold">{row.user.name}</div>
          <div className="text-[10px] text-muted-foreground">{row.user.email}</div>
        </div>
      ),
    },
    {
      header: "Items",
      accessorKey: "items",
      cell: (row: any) => (
        <div className="text-xs">
          {row.items.length} {row.items.length === 1 ? "Item" : "Items"}
        </div>
      ),
    },
    {
      header: "Payment",
      accessorKey: "paymentStatus",
      cell: (row: any) => (
        <span className={cn(
          "px-2 py-1 rounded text-[10px] uppercase font-bold border",
          row.paymentStatus === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
          row.paymentStatus === "failed" ? "bg-red-500/10 border-red-500/20 text-red-500" :
          "bg-muted border-glass-border text-muted-foreground"
        )}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <span className={cn(
          "px-2 py-1 rounded text-[10px] uppercase font-bold",
          row.status === "fulfilled" ? "bg-emerald-500/10 text-emerald-500" :
          row.status === "processing" ? "bg-amber-500/10 text-amber-500" :
          "bg-muted text-muted-foreground"
        )}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: (row: any) => (
        <div className="font-bold text-foreground">
          ${parseFloat(row.totalAmount).toFixed(2)}
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (row: any) => (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {format(new Date(row.createdAt), "MMM d, h:mm a")}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Global Operations</h2>
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <DataTable 
        columns={columns} 
        data={allOrders} 
      />
    </div>
  );
}
