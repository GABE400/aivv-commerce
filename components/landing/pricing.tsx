"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for individual sellers starting their first store.",
    features: [
      "1 Branded Storefront",
      "Unlimited Products",
      "Manual Fulfillment",
      "Standard Analytics",
      "Global Checkout Integration",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$149",
    description: "Scale your business with advanced automation tools.",
    features: [
      "Everything in Starter",
      "Automated Order Fulfillment",
      "Global Supplier Network",
      "Advanced Revenue Analytics",
      "Priority Email Support",
      "Role-Based Access Control",
    ],
    cta: "Get Started Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom solutions for large-scale SaaS operations.",
    features: [
      "White-label Dashboard",
      "Custom Supplier API",
      "Dedicated Success Manager",
      "24/7 Phone Support",
      "SSO & Custom Security",
      "SLA Guarantees",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
      
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-20 text-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, scale-ready <span className="text-gradient">pricing.</span></h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. Choose the plan that fits your business stage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "h-full relative overflow-hidden group transition-all duration-500",
                tier.highlighted ? "border-accent ring-1 ring-accent/50 shadow-[0_0_40px_rgba(124,58,237,0.15)] bg-accent/5 dark:bg-accent/[0.02]" : "hover:border-accent/30"
              )}>
                {tier.highlighted && (
                  <div className="absolute top-0 right-0 px-4 py-1 accent-gradient text-[10px] font-bold uppercase tracking-widest text-white rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-8">
                    <h3 className="text-lg font-bold mb-2 text-foreground">{tier.name}</h3>
                    <div className="flex items-baseline space-x-1 text-foreground">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.price !== "Custom" && <span className="text-muted-foreground text-sm">/month</span>}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-3 text-sm">
                        <Check className="size-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={tier.highlighted ? "primary" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
