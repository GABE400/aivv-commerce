"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ChevronRight, Play, Star, ShoppingBag, Palette } from "lucide-react";

interface ProductItem {
  name: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
  tag: string;
  isPOD?: boolean;
}

const dropshipProducts: ProductItem[] = [
  {
    name: "Aura Runner Pro",
    price: "$189.00",
    image: "/products/sneakers.png",
    rating: 4.9,
    reviews: 2841,
    tag: "Best Seller",
  },
  {
    name: "Pulse Smartwatch",
    price: "$349.00",
    image: "/products/smartwatch.png",
    rating: 4.8,
    reviews: 1204,
    tag: "New",
  },
  {
    name: "Stealth Hoodie",
    price: "$89.00",
    image: "/products/hoodie.png",
    rating: 4.7,
    reviews: 3502,
    tag: "Trending",
  },
  {
    name: "Nova Earbuds",
    price: "$129.00",
    image: "/products/earbuds.png",
    rating: 4.9,
    reviews: 5190,
    tag: "Top Rated",
  },
];

const podProducts: ProductItem[] = [
  {
    name: "Custom Art Tee",
    price: "$34.99",
    image: "/products/tshirt.png",
    rating: 4.8,
    reviews: 8420,
    tag: "Your Design",
    isPOD: true,
  },
  {
    name: "Marble Phone Case",
    price: "$24.99",
    image: "/products/phonecase.png",
    rating: 4.7,
    reviews: 3150,
    tag: "Customizable",
    isPOD: true,
  },
  {
    name: "Artist Mug",
    price: "$19.99",
    image: "/products/mug.png",
    rating: 4.9,
    reviews: 6780,
    tag: "POD Hit",
    isPOD: true,
  },
  {
    name: "Canvas Tote",
    price: "$29.99",
    image: "/products/totebag.png",
    rating: 4.6,
    reviews: 2340,
    tag: "Eco-Friendly",
    isPOD: true,
  },
];

type ProductCategory = "dropship" | "pod";

export function Hero() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("dropship");
  const products = activeCategory === "dropship" ? dropshipProducts : podProducts;

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-30 dark:opacity-20 blur-[120px] pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/20 dark:bg-accent/40 animate-pulse-slow" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-purple-600/30 animate-pulse-slow" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-xs font-medium text-accent mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span>v1.0 is now live</span>
                <ChevronRight className="size-3" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
                Automate your business. <br />
                <span className="text-gradient">Shop without inventory.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Aivv gives businesses AI-powered automation using their own API keys — and runs a global print-on-demand store so you can shop without us holding any stock.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a href="#automation" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full font-bold">
                    Start Free — No Card Needed
                  </Button>
                </a>
                <a href="#shop" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full font-bold">
                    Shop the Store
                  </Button>
                </a>
              </div>

              <p className="mt-3 text-xs text-muted-foreground font-sans font-normal text-center lg:text-left">
                Free plan includes 10 workflow runs/month powered by Groq. Upgrade anytime.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
                <span>✦ Free tier powered by Groq</span>
                <span>✦ BYOK: Claude · OpenAI · Gemini</span>
                <span>✦ Powered by Printify + Dodo Payments</span>
              </div>
            </motion.div>
          </div>

          {/* Product Showcase Grid */}
          <div className="flex-1 w-full max-w-2xl relative">
            {/* Category Toggle */}
            <div className="flex items-center justify-center mb-6 gap-2">
              <button
                onClick={() => setActiveCategory("dropship")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === "dropship"
                    ? "accent-gradient text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                    : "glass border border-glass-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShoppingBag className="size-3.5" />
                Dropshipping
              </button>
              <button
                onClick={() => setActiveCategory("pod")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === "pod"
                    ? "accent-gradient text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                    : "glass border border-glass-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Palette className="size-3.5" />
                Print on Demand
              </button>
            </div>

            {/* Products Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 gap-4 md:gap-5"
              >
                {products.map((product, i) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <motion.div
                      animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                      transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                      className="group relative glass rounded-2xl border border-glass-border overflow-hidden hover:border-accent/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
                    >
                      {/* Tag Badge */}
                      <div className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                        "isPOD" in product && product.isPOD 
                          ? "bg-gradient-to-r from-pink-500 to-violet-500" 
                          : "accent-gradient"
                      }`}>
                        {product.tag}
                      </div>

                      {/* Quick Action Button */}
                      <div className="absolute top-3 right-3 z-10 size-8 rounded-full bg-background/80 dark:bg-background/60 backdrop-blur-sm border border-glass-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-accent hover:text-white hover:border-accent">
                        {"isPOD" in product && product.isPOD ? (
                          <Palette className="size-3.5" />
                        ) : (
                          <ShoppingBag className="size-3.5" />
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="relative aspect-square bg-gradient-to-b from-muted/30 to-muted/60 p-4 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-3 md:p-4 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          {product.isPOD && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 font-bold uppercase">
                              POD
                            </span>
                          )}
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {product.name}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-foreground">
                            {product.price}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {product.rating}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({product.reviews.toLocaleString()})
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Floating Stats Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 right-0 lg:-right-6 glass p-4 rounded-xl border border-glass-border shadow-2xl hidden md:block z-20"
            >
              <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Live Revenue</div>
              <div className="text-xl font-bold text-foreground">$12,482.00</div>
              <div className="text-[10px] text-emerald-500 font-medium">+23% today</div>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 left-0 lg:-left-10 glass p-4 rounded-xl border border-glass-border shadow-2xl hidden md:block z-20"
            >
              <div className="flex items-center space-x-3">
                <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">
                    {activeCategory === "pod" ? "Design Printed" : "Order Fulfilled"}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {activeCategory === "pod" ? "Custom Art Tee (M)" : "Stealth Hoodie (Black)"}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
