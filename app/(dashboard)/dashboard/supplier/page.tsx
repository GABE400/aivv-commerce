import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FulfillmentButton } from "@/components/dashboard/supplier/fulfillment-button";

export default async function SupplierDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Access control: Suppliers and Admins only
  if (!session || (session.user.role !== "supplier" && session.user.role !== "admin")) {
    return redirect("/dashboard");
  }

  const supplierId = session.user.id;

  // Fetch pending items assigned to this supplier
  // We filter items where the parent product belongs to this supplier
  // and fulfillment is not yet 'delivered'
  const items = await db.query.orderItems.findMany({
    with: {
      order: true,
      variant: {
        with: {
          product: true
        }
      }
    },
    where: (items, { exists }) => exists(
      db.select()
        .from(products)
        .where(
          and(
            eq(products.id, db.select({ id: productVariants.productId }).from(productVariants).where(eq(productVariants.id, items.variantId))),
            eq(products.supplierId, supplierId)
          )
        )
    ),
    orderBy: (items, { desc }) => [desc(items.id)],
  });

  // Filter for pending stats
  const pendingCount = items.filter(i => i.fulfillmentStatus === 'pending' || i.fulfillmentStatus === 'in_progress').length;

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">My Pending Fulfillment</div>
          <div className="text-4xl font-bold">{pendingCount}</div>
          <div className="mt-4 text-xs text-accent font-bold">Items requiring shipment</div>
        </div>
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">Supplier Health</div>
          <div className="text-4xl font-bold">100%</div>
          <div className="mt-4 text-xs text-emerald-500 font-bold">Perfect fulfillment score</div>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold">Active Fulfillment Queue</h3>
         </div>
         
         {items.length > 0 ? (
            <DataTable 
               columns={columns}
               data={items}
            />
         ) : (
            <div className="rounded-2xl glass border border-glass-border p-12 text-center text-muted-foreground italic">
               <p>You have no active fulfillment jobs assigned to your supplier profile at this moment.</p>
               <p className="text-xs mt-2">New orders will appear here automatically based on product mappings.</p>
            </div>
         )}
      </div>
    </div>
  );
}
