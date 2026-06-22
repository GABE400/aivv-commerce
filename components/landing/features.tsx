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
  BarChart3,
  CreditCard 
} from "lucide-react";

const features = [
  {
    title: "Global Payments",
    description: "Handle global taxes and multi-currency checkout automatically with an integrated Merchant of Record.",
    icon: Globe,
  },
  {
    title: "On-Demand Shop",
    description: "Browse and buy custom print-on-demand items, manufactured and shipped on demand.",
    icon: Package,
  },
  {
    title: "Bring Your Own Key",
    description: "Connect Anthropic, OpenAI, Gemini, or OpenRouter keys, or run using our default Groq connection.",
    icon: Zap,
  },
  {
    title: "Granular Security",
    description: "Enterprise-grade authentication with local encryption for API credentials.",
    icon: Lock,
  },
  {
    title: "Task-Specific Routing",
    description: "Map different models (Claude, GPT, Llama) to specific tasks to balance cost and latency.",
    icon: Layers,
  },
  {
    title: "Execution Logs & Analytics",
    description: "Monitor workflow runs, log histories, and token consumption in real-time.",
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
            Automated Intelligent Virtual Ventures provides a premium consumer storefront and an advanced AI automation workspace for B2B operations.
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

        {/* Dedicated Dodo Payments Highlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="relative overflow-hidden border-l-4 border-l-accent border-y border-r border-glass-border bg-glass-card bg-gradient-to-r from-accent/[0.03] to-transparent hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 group transition-all duration-300">
            {/* Subtle background glow */}
            <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-accent/10 transition-all duration-500" />
            
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-wider">
                  Payment Architecture
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  Global payments, handled.
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  Automated Intelligent Virtual Ventures integrates with Dodo Payments — your Merchant of Record for automatic tax compliance, multi-currency checkout, and global payouts. Subscribe or shop globally with ease.
                </p>
              </div>

              {/* Powered by Dodo Payments Badge */}
              <div className="flex shrink-0 items-center justify-start md:justify-end">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-400 font-bold text-xs shadow-sm backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                  <div className="size-5 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <CreditCard className="size-3" />
                  </div>
                  <span className="tracking-wide">Powered by Dodo Payments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
