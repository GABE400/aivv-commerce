import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ShopNavbar } from "@/components/storefront/shop-navbar";
import { ShopHero } from "@/components/storefront/shop-hero";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Globe, Zap, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Aivv Shop | Global Print-on-Demand & Dropshipping Storefront",
  description: "Shop without limits. Discover curated print-on-demand designs and premium dropshipping items shipped globally directly from our manufacturing partners.",
  keywords: [
    "Print on demand shop",
    "Dropshipping storefront",
    "Custom designer shirts",
    "Unique phone cases",
    "Automated e-commerce",
    "Duty-free global shipping",
    "Aivv retail shop",
  ],
  openGraph: {
    title: "Aivv Shop | Global Print-on-Demand & Dropshipping Storefront",
    description: "Every product manufactured on demand and shipped globally. No warehouse, no waiting.",
  }
};

export const revalidate = 0; // Dynamic rendering for shop

export default async function ShopPage() {
  // Fetch active categories
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  // Fetch active products with variants and category relationships
  const allProducts = await db.query.products.findMany({
    where: eq(products.isActive, true),
    with: {
      variants: true,
      category: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Navigation Header */}
      <ShopNavbar categories={allCategories} />

      <main className="flex-1">
        {/* Shop Hero Section */}
        <ShopHero />

        {/* Trust Strip */}
        <section className="py-6 border-b border-glass-border/30 bg-muted/20 backdrop-blur-sm relative z-10">
          <Container>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs md:text-sm text-muted-foreground font-semibold text-center">
              <span className="flex items-center gap-1.5"><Globe className="size-3.5 text-blue-400" /> 150+ Countries Delivered</span>
              <span className="text-glass-border/50 hidden md:inline">•</span>
              <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-blue-400" /> Avg. 1.2 Day Fulfillment</span>
              <span className="text-glass-border/50 hidden md:inline">•</span>
              <span className="flex items-center gap-1.5"><ShoppingBag className="size-3.5 text-blue-400" /> Print on Demand</span>
              <span className="text-glass-border/50 hidden md:inline">•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-blue-400" /> Secure Checkout via Dodo Payments</span>
            </div>
          </Container>
        </section>

        {/* Catalog Section */}
        <section id="catalog" className="py-20 relative bg-background">
          {/* Subtle background glow */}
          <div className="absolute left-[5%] top-[25%] w-[400px] h-[400px] bg-blue-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute right-[5%] bottom-[25%] w-[400px] h-[400px] bg-indigo-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

          <Container>
            <Suspense fallback={<div className="text-center py-20 text-muted-foreground text-sm font-semibold">Loading Catalog...</div>}>
              <ShopCatalog initialProducts={allProducts} />
            </Suspense>
          </Container>
        </section>

        {/* How It Works Strip */}
        <section className="py-16 border-t border-glass-border/30 bg-muted/20 relative overflow-hidden">
          <Container>
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-bold font-syne text-foreground tracking-tight">How it works</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
              {[
                { step: "1", title: "Browse the catalog", desc: "Select from our curated print-on-demand designs and dropshipped listings." },
                { step: "2", title: "Place your order", desc: "Pay securely in USD or your local currency using Dodo Payments checkout." },
                { step: "3", title: "We manufacture & ship", desc: "Our global supplier network manufactures and delivers directly to your door." }
              ].map((item) => (
                <div key={item.step} className="space-y-3 relative group">
                  <div className="size-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(59,130,246,0.08)] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Footer B2B CTA Banner */}
        <section className="py-16 bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-blue-950/70 border-t border-glass-border/30 relative text-white">
          <Container>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-lg font-bold text-white font-syne">Looking to automate your business?</h3>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  Use Aivv’s AI-powered workspace to set up automated workflows, connect your business, and run operations on autopilot.
                </p>
              </div>

              <div className="shrink-0">
                <a href="/">
                  <Button variant="outline" className="border-blue-500/30 hover:border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer">
                    Explore Aivv for Business →
                  </Button>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  );
}
