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
    <section id="products" className="py-24 relative overflow-hidden bg-background">
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-accent uppercase tracking-[0.2em] mb-4">Curated Collection</h2>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Featured <span className="text-transparent bg-clip-text accent-gradient">Masterpieces</span>
            </h1>
          </div>
          <Link href="/shop">
            <Button variant="ghost" className="group gap-2 font-bold hover:bg-accent/10">
              View All Catalog
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {allProducts.map((product) => {
            const prices = product.variants.map(v => parseFloat(v.price));
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            
            return (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass border border-glass-border mb-6 group-hover:border-accent/30 transition-all duration-500">
                  {product.images[0] ? (
                    <Image 
                      src={product.images[0]} 
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-muted/20">
                      <ShoppingBag className="size-12 text-muted" />
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full glass border border-white/10 text-[10px] uppercase font-bold tracking-widest text-white shadow-xl">
                      {product.type}
                    </span>
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <Button className="accent-gradient text-white rounded-xl font-bold shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                        Quick View
                     </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                      {product.category?.name || "Global Store"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="size-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold">4.9</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-accent transition-colors">{product.name}</h3>
                  <p className="text-xl font-black text-foreground">
                    ${minPrice.toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </section>
  );
}
