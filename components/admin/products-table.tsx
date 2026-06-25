"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  deleteProductAction,
  reactivateProductAction,
} from "@/lib/actions/products";
import { toast } from "sonner";

interface ProductsTableProps {
  data: any[];
}

export function ProductsTable({ data }: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const handleDelete = (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    setDeletingId(productId);
    startTransition(async () => {
      try {
        const res = (await deleteProductAction(productId)) as any;
        if (res.success) {
          toast.success(
            res.message || `Successfully processed ${productName}.`,
          );
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete product.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleReactivate = (productId: string, productName: string) => {
    setReactivatingId(productId);
    startTransition(async () => {
      try {
        const res = (await reactivateProductAction(productId)) as any;
        if (res.success) {
          toast.success(`Successfully reactivated ${productName}!`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to reactivate product.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      } finally {
        setReactivatingId(null);
      }
    });
  };

  const columns = [
    {
      header: "Product",
      accessorKey: "name",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-glass-border">
            {row.images[0] ? (
              <Image
                src={row.images[0]}
                alt={row.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-[10px] text-muted-foreground uppercase font-bold">
                No Image
              </span>
            )}
          </div>
          <div>
            <div className="font-bold">{row.name}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {row.category?.name || "Uncategorized"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (row: any) => (
        <span className="px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent text-[10px] uppercase font-bold">
          {row.type}
        </span>
      ),
    },
    {
      header: "Variants",
      accessorKey: "variants",
      cell: (row: any) => (
        <span className="text-sm font-medium">
          {row.variants.length} Variants
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row: any) => (
        <span
          className={
            row.isActive
              ? "text-emerald-500 font-bold"
              : "text-red-500 font-bold"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Price Range",
      accessorKey: "variants",
      cell: (row: any) => {
        const prices = row.variants.map((v: any) => parseFloat(v.price));
        if (prices.length === 0) return "-";
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return (
          <span className="font-bold">
            $
            {min === max
              ? min.toFixed(2)
              : `${min.toFixed(2)} - ${max.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      header: "Cost Range",
      accessorKey: "variants",
      cell: (row: any) => {
        const costPrices = row.variants
          .map((v: any) => parseFloat(v.costPrice))
          .filter(Boolean);
        if (costPrices.length === 0) return "-";
        const minCost = Math.min(...costPrices);
        const maxCost = Math.max(...costPrices);
        return (
          <span className="text-sm text-muted-foreground">
            $
            {minCost === maxCost
              ? minCost.toFixed(2)
              : `${minCost.toFixed(2)} - ${maxCost.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      header: "Profit Range",
      accessorKey: "variants",
      cell: (row: any) => {
        const profits = row.variants
          .filter((v: any) => v.costPrice && v.price)
          .map((v: any) => parseFloat(v.price) - parseFloat(v.costPrice));
        if (profits.length === 0) return "-";
        const minProfit = Math.min(...profits);
        const maxProfit = Math.max(...profits);
        return (
          <span className="text-sm font-medium text-green-600">
            $
            {minProfit === maxProfit
              ? minProfit.toFixed(2)
              : `${minProfit.toFixed(2)} - ${maxProfit.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      header: "Origin",
      accessorKey: "supplierProductId",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.supplierProductId ? (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] uppercase font-bold">
              Synced
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold">
              Local
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.supplierProductId ? (
            <Link href={`/dashboard/admin/products/${row.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 h-8 w-8 hover:bg-accent/10 hover:text-accent"
              >
                <Edit2 className="size-3.5" />
              </Button>
            </Link>
          ) : (
            <div title="Local products cannot be customized">
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="size-8 h-8 w-8 opacity-20 cursor-not-allowed"
              >
                <Edit2 className="size-3.5" />
              </Button>
            </div>
          )}
          {!row.isActive ? (
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending && reactivatingId === row.id}
              onClick={() => handleReactivate(row.id, row.name)}
              className="size-8 h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10 disabled:opacity-40"
            >
              {isPending && reactivatingId === row.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending && deletingId === row.id}
            onClick={() => handleDelete(row.id, row.name)}
            className="size-8 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 disabled:opacity-40"
          >
            {isPending && deletingId === row.id ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}
