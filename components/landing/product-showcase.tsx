import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, ArrowRight } from "lucide-react";

export async function ProductShowcase() {
  const allProducts = await db.query.products.findMany({
    where: (products, { eq }) => eq(products.isActive, true),
    with: {
      variants: true,
      category: true,
    },
    limit: 8,
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  if (allProducts.length === 0) return null;

  return (
    <section id="shop" className="py-24 relative overflow-hidden bg-background">
      {/* Background glow highlights */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/3 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute left-[-10%] bottom-0 w-[400px] h-[400px] bg-purple-500/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-[10px] font-bold text-accent uppercase tracking-wider mb-6">
            <ShoppingBag className="size-3" />
            Storefront
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground font-syne">
            Shop our store. <span className="text-gradient">We handle everything.</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Browse our print-on-demand catalog. Every order is fulfilled automatically — no warehouse, no delays.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {allProducts.map((product) => {
            const prices = product.variants.map(v => parseFloat(v.price));
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            
            return (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                className="group relative"
              >
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass border border-glass-border mb-6 group-hover:border-accent/40 shadow-sm group-hover:shadow-[0_0_40px_rgba(124,58,237,0.12)] transition-all duration-500">
                  {product.images[0] ? (
                     <Image 
                      src={product.images[0]} 
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-muted/20">
                      <ShoppingBag className="size-12 text-muted" />
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] uppercase font-bold tracking-widest text-white shadow-md">
                      {product.type}
                    </span>
                  </div>

                  {/* Elegant Gradient Shadow Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Modern Quick View Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="flex items-center gap-2 px-5 py-3 bg-white text-black dark:bg-foreground dark:text-background font-bold text-xs rounded-full shadow-2xl translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-105 active:scale-95">
                      <span>Quick View</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-widest">
                      {product.category?.name || "Global Store"}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/30 border border-glass-border">
                      <Star className="size-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-foreground">4.9</span>
                    </div>
                  </div>
                  <h3 className="text-base md:text-lg font-bold group-hover:text-accent transition-colors duration-300 truncate text-foreground/90">{product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-foreground">${minPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">USD</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View Full Catalog Button & Trust Disclaimer */}
        <div className="mt-20 flex flex-col items-center justify-center gap-6">
          <Link href="/shop">
            <Button size="lg" className="font-bold px-10 h-14 rounded-2xl accent-gradient text-white shadow-xl shadow-accent/20 transition-transform active:scale-95 cursor-pointer">
              View Full Catalog
            </Button>
          </Link>
          
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-full border border-glass-border bg-glass-card/30 text-xs text-muted-foreground font-semibold">
            <span>Fulfilled by Printify</span>
            <span className="text-accent/40">•</span>
            <span>Global shipping</span>
            <span className="text-accent/40">•</span>
            <span>Payments via Dodo Payments</span>
          </div>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </section>
  );
}
