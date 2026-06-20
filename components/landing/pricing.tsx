"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const automationTiers = [
  {
    name: "Starter",
    price: "$29",
    description: "Ideal for individuals starting out with business automation.",
    features: [
      "5 Active Workflows",
      "1 AI API Key",
      "Email Support",
      "Remote Setup Guide",
    ],
    cta: "Start with Starter",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$79",
    description: "Perfect for scaling businesses and operators.",
    features: [
      "20 Active Workflows",
      "Unlimited API Keys",
      "Webhook Triggers",
      "Priority Email Support",
    ],
    cta: "Start with Growth",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$199",
    description: "Full suite for power-users, enterprises, and local teams.",
    features: [
      "Unlimited Workflows",
      "Multi-User Accounts",
      "White-Label Console",
      "On-Site Setup Included (Zambia)",
      "Dedicated Phone Support",
    ],
    cta: "Start with Agency",
    highlighted: false,
  },
];

export function Pricing() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Thanks for your interest! We've added you to the sellers waitlist.");
    setEmail("");
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background border-t border-glass-border">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
      
      <Container>
        {/* Main Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 text-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, scale-ready <span className="text-gradient">pricing.</span></h2>
          <p className="text-lg text-muted-foreground">
            No hidden transaction fees. Choose the tier that matches your business model.
          </p>
        </div>

        {/* Block 1: AI Automation Plans */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-[10px] font-bold text-accent uppercase tracking-wider mb-4">
              AI Automation Plans
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">Automate your business</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {automationTiers.map((tier, index) => (
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
                      <h4 className="text-lg font-bold mb-2 text-foreground">{tier.name}</h4>
                      <div className="flex items-baseline space-x-1 text-foreground">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
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
                      className="w-full font-bold" 
                      variant={tier.highlighted ? "primary" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Block 2: Seller Plans (Coming Soon) */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-[10px] font-bold text-accent uppercase tracking-wider mb-4">
              Seller Plans
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">Coming Soon</h3>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border border-glass-border bg-glass-card/45 relative overflow-hidden group p-8 md:p-12 text-center">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                Waiting List
              </div>
              <CardContent className="space-y-6 max-w-lg mx-auto p-0">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Want to sell your own products through Aivv? We're opening the marketplace soon.
                </p>
                
                {!isSubmitted ? (
                  <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl glass border border-glass-border focus:border-accent bg-transparent px-4 w-full text-center sm:text-left"
                      required
                    />
                    <Button type="submit" className="h-12 px-8 font-bold accent-gradient text-white shadow-xl shadow-accent/20 rounded-xl w-full sm:w-auto shrink-0 transition-transform active:scale-95 cursor-pointer">
                      Join Waitlist
                    </Button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm"
                  >
                    <Check className="size-4" />
                    You are on the list! We'll email you updates.
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Global Payments Disclaimer */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center text-xs md:text-sm text-muted-foreground font-medium"
        >
          All plans billed monthly. Cancel anytime. All payments processed via Dodo Payments.
        </motion.p>
      </Container>
    </section>
  );
}
