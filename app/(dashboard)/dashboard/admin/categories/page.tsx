import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CategoriesClient } from "./categories-client";

export default async function AdminCategoriesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return redirect("/login");
  }

  // Fetch categories with associated products count
  const allCategories = await db.query.categories.findMany({
    with: {
      products: true,
    },
    orderBy: (categories, { desc }) => [desc(categories.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Catalog Management</h2>
        <h1 className="text-3xl font-bold text-foreground">Product Categories</h1>
      </div>

      <CategoriesClient initialCategories={allCategories} />
    </div>
  );
}
