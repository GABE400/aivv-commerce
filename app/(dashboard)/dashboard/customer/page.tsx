import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserSubscription } from "@/lib/actions/ai";
import { OrdersTable } from "@/components/customer/orders-table";

export default async function CustomerDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  if (!session.user.tosAccepted) {
    return redirect("/onboarding/terms");
  }

  const userId = session.user.id;
  const subscription = await getUserSubscription();
  const showAutomateLabel = !!(subscription && subscription.status === "active");

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


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass border border-glass-border flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase mb-2">My Total Orders</div>
            <div className="text-4xl font-bold">{orderStats[0]?.value || 0}</div>
          </div>
          <div className="mt-4 text-xs text-accent font-bold">Thank you for your business!</div>
        </div>
        <div className="p-6 rounded-2xl glass border border-glass-border flex flex-col justify-between min-h-[160px]">
          <div>
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
          </div>
          <div className="mt-4 text-xs text-accent font-bold">Digital products available here</div>
        </div>
        <div className="p-6 rounded-2xl glass border border-glass-border flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase mb-2">AI Automation</div>
            <div className="text-lg font-bold leading-tight">Turn into a Business</div>
            <p className="text-[11px] text-muted-foreground leading-normal mt-1">
              Access advanced workflows, list custom products, and run operations on autopilot.
            </p>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/customer/automate">
              <Button className="w-full h-9 text-xs font-bold accent-gradient text-white rounded-xl shadow-md shadow-accent/15">
                {showAutomateLabel ? "Automate your workflows" : "Upgrade & Automate"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold">Recent Purchase History</h3>
         </div>
         
         <OrdersTable orders={userOrders} />
      </div>
    </div>
  );
}
