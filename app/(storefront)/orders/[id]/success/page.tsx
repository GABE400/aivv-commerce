"use client";

import { useEffect, use } from "react";
import { useCart } from "@/lib/store/use-cart";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="pt-32 pb-20 bg-background min-h-screen">
      <Container className="max-w-2xl text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="size-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
            <CheckCircle2 className="size-12 text-emerald-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Purchase Successful!</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your order <span className="text-foreground font-mono font-bold">#{id.substring(0, 8)}</span> has been confirmed 
              and is now entering our global supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-8">
            <div className="p-6 rounded-2xl glass border border-glass-border space-y-3">
              <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Package className="size-5 text-accent" />
              </div>
              <h3 className="font-bold">Next Steps</h3>
              <p className="text-sm text-muted-foreground">
                Your order is being routed to the appropriate fulfillment centers for processing.
              </p>
            </div>
            <div className="p-6 rounded-2xl glass border border-glass-border space-y-3">
              <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <ShoppingBag className="size-5 text-accent" />
              </div>
              <h3 className="font-bold">Tracking</h3>
              <p className="text-sm text-muted-foreground">
                You can track your fulfillment status and download digital assets in your dashboard.
              </p>
            </div>
          </div>

          <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/customer" className="w-full sm:w-auto">
              <Button className="w-full h-14 rounded-2xl accent-gradient text-white font-bold px-8 shadow-xl shadow-accent/20 gap-2">
                Go to My Dashboard
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-14 rounded-2xl px-8 glass border-glass-border">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
