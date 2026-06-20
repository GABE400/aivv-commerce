"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Search, X, SlidersHorizontal, ArrowDownAZ, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CatalogFiltersProps {
  categories: Category[];
}

export function CatalogFilters({ categories }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Search input local state (to prevent reload on every keystroke)
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  // Sync state with url updates
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  const updateParams = (updates: Record<string, string | null>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateParams({ search: null });
  };

  const currentCategory = searchParams.get("category") || "";
  const currentType = searchParams.get("type") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const hasActiveFilters = 
    searchParams.get("search") || 
    searchParams.get("category") || 
    searchParams.get("type") || 
    searchParams.get("sort") !== "newest";

  return (
    <div className="space-y-6">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full h-11 pl-11 pr-10 rounded-xl glass border-glass-border focus:border-accent text-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="appearance-none h-11 pl-4 pr-10 rounded-xl glass border border-glass-border text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:border-accent bg-[#0B0F19]"
            >
              <option value="newest">Latest Products</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <ArrowDownAZ className="size-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Product Types Filters */}
      <div className="space-y-4">
        {/* Dynamic Categories Pills */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Categories</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
            <Button
              variant={currentCategory === "" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateParams({ category: null })}
              className="rounded-full text-xs font-bold"
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={currentCategory === category.slug ? "primary" : "outline"}
                size="sm"
                onClick={() => updateParams({ category: category.slug })}
                className="rounded-full text-xs font-bold"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Type Filter Pills */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Fulfillment Mode</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={currentType === "" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateParams({ type: null })}
              className="rounded-full text-xs font-bold"
            >
              All Fulfillment
            </Button>
            <Button
              variant={currentType === "pod" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateParams({ type: "pod" })}
              className="rounded-full text-xs font-bold"
            >
              Print-on-Demand (POD)
            </Button>
            <Button
              variant={currentType === "dropship" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateParams({ type: "dropship" })}
              className="rounded-full text-xs font-bold"
            >
              Dropshipping
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-semibold">Active filters:</span>
            {searchParams.get("search") && (
              <BadgeFilter label={`Search: "${searchParams.get("search")}"`} onRemove={handleClearSearch} />
            )}
            {searchParams.get("category") && (
              <BadgeFilter 
                label={`Category: ${categories.find(c => c.slug === currentCategory)?.name || currentCategory}`} 
                onRemove={() => updateParams({ category: null })} 
              />
            )}
            {searchParams.get("type") && (
              <BadgeFilter 
                label={currentType === "pod" ? "Print-on-Demand" : "Dropshipping"} 
                onRemove={() => updateParams({ type: null })} 
              />
            )}
            {searchParams.get("sort") && currentSort !== "newest" && (
              <BadgeFilter 
                label={currentSort === "price-asc" ? "Price: Low to High" : "Price: High to Low"} 
                onRemove={() => updateParams({ sort: null })} 
              />
            )}
          </div>
          <button
            onClick={() => {
              setSearchInput("");
              router.push(pathname);
            }}
            className="text-xs font-bold text-accent hover:underline flex-shrink-0"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

function BadgeFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-glass-border text-[10px] font-bold uppercase tracking-wider text-foreground">
      {label}
      <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
        <X className="size-3" />
      </button>
    </span>
  );
}
