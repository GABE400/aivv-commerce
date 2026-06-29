"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const automationTiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Try Aivv with our built-in AI — no API key needed.",
    features: [
      "10 Workflow Runs/month",
      "1 Pre-built Workflow",
      "Powered by Groq (Llama 3.3)",
      "Manual Triggers Only",
      "Community Support",
    ],
    cta: "Start for Free",
    highlighted: false,
    isFree: true,
  },
  {
    id: "starter",
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
    id: "growth",
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
    id: "agency",
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

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background border-t border-glass-border">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
      
      <Container>
        {/* Main Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 text-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, scale-ready <span className="text-gradient">pricing.</span></h2>
          <p className="text-lg text-muted-foreground">
            Start free with Groq. Upgrade when your business needs more.
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {automationTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Card className={cn(
                  "w-full h-full relative overflow-hidden group transition-all duration-500",
                  tier.highlighted ? "border-accent ring-1 ring-accent/50 shadow-[0_0_40px_rgba(124,58,237,0.15)] bg-accent/5 dark:bg-accent/[0.02]" : "hover:border-accent/30"
                )}>
                  {tier.highlighted && (
                    <div className="absolute top-0 right-0 px-4 py-1 accent-gradient text-[10px] font-bold uppercase tracking-widest text-white rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <CardContent className="p-8 flex flex-col h-full justify-between">
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

                    <div className="mt-auto">
                      <Link 
                        href={tier.isFree ? "/signup" : `/dashboard/customer/automate?plan=${tier.id}`}
                        className={cn(
                          buttonVariants({ variant: tier.highlighted ? "primary" : "outline" }),
                          "w-full font-bold inline-flex items-center justify-center"
                        )}
                      >
                        {tier.cta}
                      </Link>

                      {tier.isFree && (
                        <p className="mt-2 text-center text-[10px] text-muted-foreground font-medium">
                          No credit card required.
                        </p>
                      )}

                      {tier.isFree && (
                        <div className="mt-6 pt-4 border-t border-glass-border/50 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                          <span>Powered by</span>
                          <div className="flex items-center gap-1 text-foreground">
                            <svg className="size-3 fill-orange-500 shrink-0" viewBox="0 0 24 24">
                              <path d="M12 2L2 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            <span>Groq</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TODO: Re-enable when US Business Launch is ready */}
        {/* <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
              Business Add-on
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground font-syne">
              US Business Formation & Compliance
            </h3>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Card className="w-full relative overflow-hidden group transition-all duration-500 border-blue-500/30 hover:border-blue-500 bg-blue-500/[0.01] hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] rounded-2xl">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-blue-600 text-[10px] font-bold uppercase tracking-widest text-white rounded-bl-lg shadow-sm">
                Renews annually. Cancel anytime.
              </div>

              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider">
                    US Business Formation & Compliance
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-foreground">
                    <span className="text-4xl font-extrabold font-syne text-foreground">$249</span>
                    <span className="text-muted-foreground text-sm">/year</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      Save over $1,750/year
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    LLC filing, EIN, registered agent, annual report, bookkeeping. <span className="text-blue-400/90 font-medium">(Typically $1,999/year on other compliance platforms)</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2">
                    {[
                      "LLC filing in all 50 states",
                      "EIN (Tax ID) Registration",
                      "Registered Agent Service (1 Year)",
                      "Annual Report filing assistance",
                      "Bookkeeping synced directly to Aivv revenue"
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2.5 text-sm">
                        <Check className="size-4 text-blue-400 shrink-0" />
                        <span className="text-muted-foreground group-hover:text-foreground/90 transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-start md:justify-end md:w-56">
                  <Link
                    href="/signup"
                    className="w-full h-12 font-bold inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 active:scale-95 cursor-pointer shadow-lg shadow-blue-500/25 group"
                  >
                    Add to your plan →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div> */}

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
