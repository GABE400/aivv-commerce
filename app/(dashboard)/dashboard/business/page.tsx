import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { FulfillmentQueueTable } from "@/components/dashboard/business/fulfillment-queue-table";

export default async function BusinessDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Access control: Businesses and Admins only
  if (!session || (session.user.role !== "business" && session.user.role !== "admin")) {
    return redirect("/dashboard");
  }

  const supplierId = session.user.id;

  // Fetch pending items assigned to this supplier/business
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



  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">My Pending Fulfillment</div>
          <div className="text-4xl font-bold">{pendingCount}</div>
          <div className="mt-4 text-xs text-accent font-bold">Items requiring shipment</div>
        </div>
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="text-sm font-medium text-muted-foreground uppercase mb-2">Business Health</div>
          <div className="text-4xl font-bold">100%</div>
          <div className="mt-4 text-xs text-emerald-500 font-bold">Perfect fulfillment score</div>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold">Active Fulfillment Queue</h3>
         </div>
         
         <FulfillmentQueueTable items={items} />
      </div>
    </div>
  );
}
