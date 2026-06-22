import { db } from "@/lib/db";
import { categories, users } from "@/lib/db/schema";
import { ProductForm } from "@/components/admin/product-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";

export default async function NewProductPage() {
  const allCategories = await db.select().from(categories);
  const allSuppliers = await db.select().from(users).where(eq(users.role, "business"));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard/admin/products" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to Catalog
        </Link>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">New Product</h2>
          <h1 className="text-3xl font-bold">Unleash a masterpiece</h1>
        </div>
      </div>

      <ProductForm categories={allCategories} suppliers={allSuppliers} />
    </div>
  );
}
