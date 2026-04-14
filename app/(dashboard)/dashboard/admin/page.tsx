import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { RecentOrdersTable } from "@/components/admin/recent-orders-table";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session?.user.role !== "admin") {
    return redirect("/dashboard/customer");
  }

  // Fetch real stats
  const [stats] = await db.select({
    revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    orderCount: sql<number>`COUNT(*)`,
    userCount: sql<number>`(SELECT COUNT(*) FROM ${users})`,
  }).from(orders);

  const recentOrders = await db.query.orders.findMany({
    with: {
      user: true,
    },
    limit: 5,
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">Total Revenue</div>
          <div className="text-4xl font-bold">${parseFloat(stats.revenue || "0").toFixed(2)}</div>
          <div className="mt-4 text-xs text-emerald-500 font-bold">All time earnings</div>
        </div>
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">Total Orders</div>
          <div className="text-4xl font-bold">{stats.orderCount}</div>
          <div className="mt-4 text-xs text-blue-500 font-bold">Globally fulfilled</div>
        </div>
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">Total Users</div>
          <div className="text-4xl font-bold">{stats.userCount}</div>
          <div className="mt-4 text-xs text-purple-500 font-bold">Customer & Suppliers</div>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold">Recent Global Activity</h3>
            <Link href="/dashboard/admin/orders">
              <button className="text-xs font-bold text-accent hover:underline">View All Orders</button>
            </Link>
         </div>
          <RecentOrdersTable 
             data={recentOrders}
          />
      </div>
    </div>
  );
}
