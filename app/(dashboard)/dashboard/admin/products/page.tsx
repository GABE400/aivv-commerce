import { db } from "@/lib/db";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PrintifySyncButton } from "@/components/admin/printify-sync-button";
import { CjSyncButton } from "@/components/admin/cj-sync-button";

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    with: {
      category: true,
      variants: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Catalog Management</h2>
          <h1 className="text-3xl font-bold">Store Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <PrintifySyncButton />
          <CjSyncButton />
          <Link href="/dashboard/admin/products/new">
            <Button className="accent-gradient text-white gap-2 font-bold shadow-lg shadow-accent/20">
              <Plus className="size-4" />
              Create Product
            </Button>
          </Link>
        </div>
      </div>

      <ProductsTable 
        data={allProducts} 
      />
    </div>
  );
}
