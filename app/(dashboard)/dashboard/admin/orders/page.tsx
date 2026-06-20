import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { OrdersClient } from "./orders-client";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Global Operations</h2>
        <h1 className="text-3xl font-bold">Orders Console</h1>
      </div>

      <OrdersClient initialOrders={allOrders} />
    </div>
  );
}
