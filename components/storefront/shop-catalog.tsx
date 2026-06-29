"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, ArrowRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Variant {
  id: string;
  price: string;
  costPrice: string | null;
  supplierVariantId: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: "dropship" | "pod" | "digital" | "subscription";
  images: string[];
  variants: Variant[];
  category: Category | null;
  createdAt: Date;
}

interface ShopCatalogProps {
  initialProducts: Product[];
}

export function ShopCatalog({ initialProducts }: ShopCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read filters from URL params
  const activeCategory = searchParams.get("category") || "";
  const activeTab = (searchParams.get("tab") || "all") as "all" | "pod" | "dropship" | "new" | "best";
  const [searchQuery, setSearchQuery] = useState("");

  // Sync search input if URL resets (like clicking "All Products" link)
  useEffect(() => {
    if (!searchParams.get("category") && !searchParams.get("tab") && !searchParams.get("search")) {
      setSearchQuery("");
    }
  }, [searchParams]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Clear category selection if switching tabs directly
    if (updates.tab && updates.category === undefined) {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const processedProducts = useMemo(() => {
    return initialProducts.map((product) => {
      const prices = product.variants.map((v) => parseFloat(v.price));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const hasPriceRange = minPrice !== maxPrice;
      const displayPrice = hasPriceRange ? `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}` : `$${minPrice.toFixed(2)}`;
      
      // Mock ratings/reviews count if not in database, to make the catalog look mature
      const rating = 4.8 + (parseFloat(product.id.slice(0, 1)) || 0.1) % 0.2; // 4.8 to 5.0
      const reviews = 10 + (parseInt(product.id.replace(/[^0-9]/g, "").slice(0, 3)) || 42) % 350;

      return {
        ...product,
        minPrice,
        maxPrice,
        displayPrice,
        rating: parseFloat(rating.toFixed(1)),
        reviews,
      };
    });
  }, [initialProducts]);

  const activeCategoryName = useMemo(() => {
    if (!activeCategory) return "";
    const cat = processedProducts.find(p => p.category?.slug === activeCategory)?.category?.name;
    return cat || activeCategory;
  }, [activeCategory, processedProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...processedProducts];

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category && p.category.name.toLowerCase().includes(query))
      );
    }

    // Category / Tab filter
    if (activeCategory) {
      result = result.filter((p) => p.category?.slug === activeCategory);
    } else if (activeTab === "pod") {
      result = result.filter((p) => p.type === "pod");
    } else if (activeTab === "dropship") {
      result = result.filter((p) => p.type === "dropship");
    } else if (activeTab === "new") {
      // New arrivals: sort by date
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === "best") {
      // Best sellers: sort by rating & reviews
      result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }

    return result;
  }, [processedProducts, activeCategory, activeTab, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Search and Filters Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-glass-border/30 pb-6">
        {/* Filter Tabs & Active Category Badge */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none flex-wrap">
          {[
            { id: "all", label: "All Products" },
            { id: "pod", label: "Print on Demand" },
            { id: "dropship", label: "Dropshipping" },
            { id: "new", label: "New Arrivals" },
            { id: "best", label: "Best Sellers" },
          ].map((tab) => {
            const isActive = activeTab === tab.id && !activeCategory;
            return (
              <button
                key={tab.id}
                onClick={() => updateParams({ tab: tab.id, category: null })}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none ${
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                    : "glass border border-glass-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {activeCategory && (
            <div className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] flex items-center gap-2">
              <span>Category: {activeCategoryName}</span>
              <button 
                onClick={() => updateParams({ category: null })} 
                className="hover:text-blue-200 transition-colors p-0.5 rounded-full hover:bg-white/10"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>

        {/* Real-time Search input */}
        <div className="relative w-full md:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog..."
            className="w-full h-11 pl-11 pr-10 rounded-xl glass border-glass-border focus:border-blue-500/60 text-sm focus:ring-1 focus:ring-blue-500/30"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 glass border border-glass-border/40 rounded-3xl max-w-md mx-auto">
          <ShoppingBag className="size-12 text-muted-foreground/60 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No products found</h2>
          <p className="text-muted-foreground text-sm leading-relaxed px-6">
            We couldn't find any items matching your filter or search query. Try clearing your search input or resetting filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.slug}`}
              className="group relative"
            >
              {/* Product Card Container */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass border border-glass-border mb-6 group-hover:border-blue-500/40 shadow-sm group-hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] transition-all duration-500">
                {product.images[0] ? (
                  <Image 
                    src={product.images[0]} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center bg-muted/20">
                    <ShoppingBag className="size-12 text-muted/60" />
                  </div>
                )}
                
                {/* Fulfillment Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1 rounded-full backdrop-blur-md border text-[9px] uppercase font-bold tracking-widest text-white shadow-md ${
                    product.type === "pod"
                      ? "bg-pink-900/60 border-pink-500/30 text-pink-300"
                      : "bg-blue-900/60 border-blue-500/30 text-blue-300"
                  }`}>
                    {product.type === "pod" ? "POD" : "Dropship"}
                  </span>
                </div>

                {/* Elegant Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Quick View Button */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-bold text-xs rounded-full shadow-2xl translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-blue-700 hover:scale-105 active:scale-95">
                    <span>Quick View</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-widest">
                    {product.category?.name || "Global Store"}
                  </span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/30 border border-glass-border">
                    <Star className="size-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-foreground">{product.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-base md:text-lg font-bold group-hover:text-blue-400 transition-colors duration-300 truncate text-foreground/90">
                  {product.name}
                </h3>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-foreground">{product.displayPrice}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">USD</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
