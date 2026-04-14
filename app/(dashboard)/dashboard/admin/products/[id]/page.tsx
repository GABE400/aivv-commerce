import { db } from "@/lib/db";
import { products, categories, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProductForm } from "@/components/admin/product-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: true,
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Security Guard: Only Printify products can be customized
  if (!product.supplierProductId) {
    return redirect("/dashboard/admin/products");
  }

  const allCategories = await db.select().from(categories);
  const allSuppliers = await db.select().from(users).where(eq(users.role, "supplier"));

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
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Edit Product</h2>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>
      </div>

      <ProductForm 
        categories={allCategories} 
        suppliers={allSuppliers} 
        initialData={product}
        productId={product.id}
      />
    </div>
  );
}
