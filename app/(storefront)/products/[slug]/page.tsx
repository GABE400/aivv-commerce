import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import Image from "next/image";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const productData = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      variants: true,
      category: true,
    },
  });

  if (!productData) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Left: Sticky Image Gallery */}
            <div className="relative">
               <div className="sticky top-32 space-y-4">
                  <div className="aspect-square glass rounded-3xl overflow-hidden border border-glass-border relative">
                    {productData.images[0] && (
                      <Image
                        src={productData.images[0]}
                        alt={productData.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {productData.images.slice(1).map((img, i) => (
                      <div key={i} className="aspect-square glass rounded-xl overflow-hidden border border-glass-border relative cursor-pointer hover:border-accent transition-colors">
                        <Image src={img} alt={`${productData.name} ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Right: Product Info & Actions */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
                  {productData.category?.name || "Premium Collection"}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {productData.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-foreground">
                    ${productData.variants[0]?.price || "0.00"}
                  </span>
                  <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase">
                    In Stock
                  </div>
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {productData.description}
              </p>

              <div className="pt-8 border-t border-glass-border">
                <AddToCartForm 
                  product={productData} 
                  variants={productData.variants} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-8">
                 <div className="p-4 rounded-xl bg-muted/50 border border-glass-border space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Fulfillment</div>
                    <div className="text-sm font-semibold text-foreground">Global Priority</div>
                 </div>
                 <div className="p-4 rounded-xl bg-muted/50 border border-glass-border space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Shipping</div>
                    <div className="text-sm font-semibold text-foreground">2-5 Business Days</div>
                 </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
