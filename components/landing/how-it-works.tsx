"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { ShoppingCart, CreditCard, Box, Truck, Check } from "lucide-react";

const steps = [
  {
    title: "Order Placed",
    description: "Customer purchases from your branded storefront.",
    icon: ShoppingCart,
  },
  {
    title: "Payment Processed",
    description: "Dodo Payments handles global taxes & checkout flow.",
    icon: CreditCard,
  },
  {
    title: "System Orchestration",
    description: "Our OS routes order data to the appropriate supplier.",
    icon: Box,
  },
  {
    title: "Automated Fulfillment",
    description: "Supplier produces, packs, and ships the product.",
    icon: Truck,
  },
  {
    title: "Tracking Delivery",
    description: "Customer receives automated tracking updates.",
    icon: Check,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30 border-y border-glass-border">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-20 text-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Automation at every step.</h2>
          <p className="text-lg text-muted-foreground">
            From the moment a customer clicks "buy" to the final delivery at their doorstep, 
            Aivv Commerce OS handles the heavy lifting.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line Desktop */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-accent/10 via-accent/50 to-accent/10 -translate-y-1/2 hidden lg:block" />
          
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="size-20 rounded-2xl bg-glass border border-glass-border shadow-sm flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 group-hover:border-accent transition-all duration-300">
                  <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
                  <step.icon className="size-8 text-accent" />
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 size-6 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-white shadow-lg">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
