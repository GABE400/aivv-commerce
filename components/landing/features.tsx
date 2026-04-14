"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, 
  Package, 
  Zap, 
  Lock, 
  Layers, 
  BarChart3 
} from "lucide-react";

const features = [
  {
    title: "Global Payments",
    description: "Handle global taxes and multi-currency checkout automatically with an integrated Merchant of Record.",
    icon: Globe,
  },
  {
    title: "No Inventory Required",
    description: "Sell print-on-demand and dropshipping products without holding any stock.",
    icon: Package,
  },
  {
    title: "Automated Fulfillment",
    description: "Orders are automatically sent to suppliers for production and shipping.",
    icon: Zap,
  },
  {
    title: "Secure Identity Hub",
    description: "Enterprise-grade authentication with multi-tenant support and granular permissions.",
    icon: Lock,
  },
  {
    title: "Supplier Abstraction",
    description: "A unified system to manage multiple suppliers under one dashboard.",
    icon: Layers,
  },
  {
    title: "Real-time Analytics",
    description: "Monitor your revenue, orders, and supplier performance in real-time.",
    icon: BarChart3,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-accent/5 dark:bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
          >
            Built for scale. <span className="text-gradient">Ready for production.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Aivv Commerce OS provides everything you need to build and scale your 
            e-commerce empire without the operational overhead.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:glass-card-hover h-full group">
                <CardContent className="p-8">
                  <div className="size-12 rounded-xl bg-accent/5 dark:bg-accent/10 flex items-center justify-center mb-6 group-hover:accent-gradient group-hover:text-white transition-all duration-300">
                    <feature.icon className="size-6 text-accent group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
