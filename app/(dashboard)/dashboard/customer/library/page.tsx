import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems, productVariants, products } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { DigitalAssetCard } from "@/components/customer/digital-asset-card";
import { ShoppingBag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CustomerLibrary() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all purchased digital assets
  const digitalAssets = await db.select({
    id: orderItems.id,
    purchaseDate: orders.createdAt,
    variant: {
        name: productVariants.name,
        assetUrl: productVariants.assetUrl,
        product: {
            name: products.name,
            images: products.images,
            description: products.description,
        }
    }
  })
  .from(orderItems)
  .innerJoin(orders, eq(orderItems.orderId, orders.id))
  .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
  .innerJoin(products, eq(productVariants.productId, products.id))
  .where(
    and(
      eq(orders.userId, userId),
      eq(orders.paymentStatus, "paid"),
      eq(products.type, "digital")
    )
  )
  .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Vault</h2>
        <h1 className="text-3xl font-bold">My Digital Library</h1>
      </div>

      {digitalAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {digitalAssets.map((asset) => (
            <DigitalAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl glass border border-glass-border p-16 text-center">
          <div className="size-20 bg-muted/20 border border-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="size-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your library is empty</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Build your collection of masterpieces. Purchased digital assets will appear here instantly.
          </p>
          <Link href="/">
            <Button className="h-12 px-8 font-bold accent-gradient text-white shadow-xl shadow-accent/20">
              Browse Collection
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
