"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2, Plus, Layers } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/lib/actions/products";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CategoryWithProducts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  products: any[];
}

interface CategoriesClientProps {
  initialCategories: CategoryWithProducts[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsCreating(true);
    startTransition(async () => {
      try {
        const res = await createCategoryAction({
          name: name.trim(),
          description: description.trim() || undefined,
        });

        if (res.success) {
          toast.success(`Successfully created category "${name.trim()}".`);
          setName("");
          setDescription("");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to create category.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      } finally {
        setIsCreating(false);
      }
    });
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      return;
    }

    setDeletingId(categoryId);
    startTransition(async () => {
      try {
        const res = await deleteCategoryAction(categoryId);
        if (res.success) {
          toast.success(`Successfully deleted category "${categoryName}".`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete category.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const columns = [
    {
      header: "Category",
      accessorKey: "name",
      cell: (row: CategoryWithProducts) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="font-bold text-foreground">{row.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row: CategoryWithProducts) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.description || <span className="italic text-muted-foreground/50">No description</span>}
        </span>
      ),
    },
    {
      header: "Products Count",
      accessorKey: "products",
      cell: (row: CategoryWithProducts) => (
        <Badge variant="outline" className="bg-glass-highlight border-glass-border font-bold">
          {row.products.length} Products
        </Badge>
      ),
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (row: CategoryWithProducts) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: CategoryWithProducts) => (
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={isPending && (deletingId === row.id || isCreating)}
          onClick={() => handleDelete(row.id, row.name)}
          className="size-8 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 disabled:opacity-40"
        >
          {isPending && deletingId === row.id ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </Button>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Creation Form */}
      <div className="col-span-1 rounded-2xl border border-glass-border glass p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Add New Category</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create a custom category to group your print-on-demand or dropshipping products.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-xs font-semibold">
              Category Name
            </Label>
            <Input
              id="category-name"
              type="text"
              placeholder="e.g. Summer Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending && isCreating}
              className="glass border-glass-border focus:border-accent/50 focus:ring-accent/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <textarea
              id="category-description"
              placeholder="Describe this category's catalog theme..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending && isCreating}
              className="flex min-h-[100px] w-full rounded-md border border-glass-border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass focus:border-accent/50"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending && isCreating}
            className="w-full accent-gradient text-white gap-2 font-bold shadow-lg shadow-accent/20 transition-all duration-200 hover:scale-[1.02]"
          >
            {isPending && isCreating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Create Category
              </>
            )}
          </Button>
        </form>
      </div>

      {/* List / Data Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">All Categories</h3>
          <span className="text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-1 rounded-full border border-glass-border">
            Total: {initialCategories.length}
          </span>
        </div>

        <DataTable columns={columns} data={initialCategories} />
      </div>
    </div>
  );
}
