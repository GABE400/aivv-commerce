import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return redirect("/dashboard");
  }

  // Fetch real paid orders
  const paidOrders = await db.query.orders.findMany({
    where: eq(orders.paymentStatus, "paid"),
    orderBy: (orders, { asc }) => [asc(orders.createdAt)],
  });

  // Calculate chronological breakdown of the last 12 months
  const last12Months: { month: string; label: string; revenue: number; count: number }[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    last12Months.push({ month: yearMonth, label, revenue: 0, count: 0 });
  }

  paidOrders.forEach((order) => {
    const d = new Date(order.createdAt);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const amount = parseFloat(order.totalAmount);
    
    const monthData = last12Months.find((m) => m.month === yearMonth);
    if (monthData) {
      monthData.revenue += amount;
      monthData.count += 1;
    }
  });

  const hasRealData = last12Months.some(m => m.revenue > 0);
  let isDemo = false;

  if (!hasRealData) {
    isDemo = true;
    // Inject premium realistic simulated demo data
    const demoData = [1250, 1840, 2900, 3100, 4800, 6200, 5800, 7400, 9800, 9100, 11400, 13800];
    const demoCounts = [6, 9, 14, 15, 22, 28, 26, 33, 44, 40, 50, 62];
    last12Months.forEach((m, idx) => {
      m.revenue = demoData[idx] || 0;
      m.count = demoCounts[idx] || 0;
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Accounting</h2>
        <h1 className="text-3xl font-bold font-syne tracking-tight">Revenue Analytics</h1>
      </div>

      <AnalyticsCharts data={last12Months} isDemo={isDemo} />
    </div>
  );
}
