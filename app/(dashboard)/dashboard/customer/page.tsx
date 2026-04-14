import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default async function CustomerDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const userId = session.user.id;

  // Fetch real data
  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: {
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

  const orderStats = await db.select({ value: count() })
    .from(orders)
    .where(eq(orders.userId, userId));

  // Calculate real stats
  const digitalAssets = userOrders.flatMap(order => 
    order.items.filter(item => item.variant.product.type === 'digital')
  );
  const activeAssetsCount = digitalAssets.length;

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">My Total Orders</div>
          <div className="text-4xl font-bold">{orderStats[0]?.value || 0}</div>
          <div className="mt-4 text-xs text-accent font-bold">Thank you for your business!</div>
        </div>
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">Active Assets</div>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">{activeAssetsCount}</div>
            {activeAssetsCount > 0 && (
              <Link href="/dashboard/customer/library">
                <Button variant="ghost" className="text-xs font-bold text-accent hover:underline px-0">
                  View Library &rarr;
                </Button>
              </Link>
            )}
          </div>
          <div className="mt-4 text-xs text-accent font-bold">Digital products available here</div>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold">Recent Purchase History</h3>
         </div>
         
         {userOrders.length > 0 ? (
            <DataTable 
               columns={columns}
               data={userOrders}
            />
         ) : (
            <div className="rounded-2xl glass border border-glass-border p-12 text-center text-muted-foreground italic">
               <ShoppingBag className="size-12 mx-auto mb-4 opacity-20" />
               <p>You haven't made any purchases yet. Start shopping to build your commerce history!</p>
               <Link href="/">
                  <Button className="mt-6 font-bold accent-gradient text-white">
                     Browse Shop
                  </Button>
               </Link>
            </div>
         )}
      </div>
    </div>
  );
}
