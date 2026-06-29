"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Globe, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Sell() {
  return (
    <section id="sell" className="py-24 relative overflow-hidden bg-background border-t border-glass-border">
      {/* Background glow highlights */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute left-[-10%] bottom-0 w-[400px] h-[400px] bg-indigo-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Column - Copy */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-[10px] font-bold text-blue-400 uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <ShoppingBag className="size-3" />
              Sell
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground font-syne tracking-tight leading-[1.1]">
              Sell globally. <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-extrabold tracking-tight">Hold nothing.</span>
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Aivv handles direct-to-consumer commerce at scale. Every order placed is automatically manufactured and shipped on demand by our global fulfillment network — zero inventory, zero logistics management.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-8 shadow-xl shadow-blue-500/25 border-none transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 group">
                  Visit the Shop
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Fulfillment Telemetry Graphic */}
          <div className="flex-1 w-full max-w-2xl relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-10 dark:opacity-20 pointer-events-none" />
            
            <Card className="glass border border-glass-border overflow-hidden rounded-3xl bg-gradient-to-b from-[#111827]/80 to-[#0B0F17]/90 shadow-2xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                
                {/* Telemetry Header */}
                <div className="flex items-center justify-between border-b border-glass-border/30 pb-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="size-4 text-blue-400 animate-spin-slow" />
                    <span className="text-xs font-bold text-foreground">Global Fulfillment Telemetry</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    100% Automated
                  </span>
                </div>

                {/* Step 1: Order Paid Checkout widget */}
                <div className="p-4 rounded-xl border border-glass-border bg-background/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Secure Checkout</div>
                      <div className="text-[10px] text-muted-foreground">Order #8291 paid via Dodo Payments</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground">$189.00 USD</span>
                </div>

                {/* Step 2: Manufacturing Status */}
                <div className="p-4 rounded-xl border border-glass-border bg-background/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <svg className="size-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 0 2 .9 2 2v1.5c0 .3-.1.6-.3.8l-3.2 3.2V11h3.5c.3 0 .6-.1.8-.3l3.2-3.2c.2-.2.5-.3.8-.3H20c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-1.5c-.3 0-.6.1-.8.3l-3.2 3.2c-.2.2-.5.3-.8.3H11v-3.5c0-.3.1-.6.3-.8l3.2-3.2c.2-.2.3-.5.3-.8V13H11v3.5c0 .3-.1.6-.3.8l-3.2 3.2c-.2.2-.5.3-.8.3H5c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2h1.5c.3 0 .6-.1.8-.3l3.2-3.2c.2-.2.3-.5.3-.8V4c0-1.1.9-2 2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Factory Print Sync</div>
                      <div className="text-[10px] text-muted-foreground">Fulfillment Node: Custom Art Tee</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 px-2 py-0.5 rounded">
                    In Production
                  </span>
                </div>

                {/* Step 3: Global Delivery Shipping Widget */}
                <div className="p-4 rounded-xl border border-glass-border bg-background/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Globe className="size-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Global Carrier Assigned</div>
                      <div className="text-[10px] text-muted-foreground">Tracking ID: AIVV-8921-GB</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="size-2.5" />
                    Delivered (London, UK)
                  </span>
                </div>

              </CardContent>
            </Card>

            {/* Floating stats badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 right-4 glass px-4 py-2.5 rounded-xl border border-glass-border shadow-2xl text-[10px] font-bold text-foreground flex items-center gap-1.5"
            >
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>Fulfilled: 1.2 Days Average</span>
            </motion.div>
          </div>

        </div>
      </Container>
    </section>
  );
}
