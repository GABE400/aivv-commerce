"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Megaphone, Lock, Check } from "lucide-react";
import { toast } from "sonner";

const teaserCards = [
  {
    title: "AI Product Descriptions",
    description: "Generate optimized Printify listings, tags, and pricing suggestions in seconds using localized SEO logic.",
    icon: Sparkles,
  },
  {
    title: "Customer Email Flows",
    description: "Auto-respond to support requests, cart abandonment, and shipping updates dynamically based on order telemetry.",
    icon: Mail,
  },
  {
    title: "Ad Copy Generator",
    description: "Generate highly converting marketing copy and target demographics for Meta, Google, and TikTok ads instantly.",
    icon: Megaphone,
  },
];

export function AIWorkflows() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Welcome aboard! We've added you to the waitlist.");
    setEmail("");
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background/50 border-t border-glass-border">
      {/* Background glow highlights */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute left-10 top-10 w-72 h-72 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-[10px] font-bold text-accent uppercase tracking-wider mb-6">
              <Sparkles className="size-3 animate-pulse" />
              Feature Preview
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground"
          >
            Your store. <span className="text-gradient">Now with a brain.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            Aivv is adding AI-powered workflow automation. Bring your own Claude or OpenAI API key and automate product descriptions, customer emails, ad copy, and more — directly inside your dashboard.
          </motion.p>
        </div>

        {/* Teaser Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teaserCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="relative overflow-hidden border border-glass-border bg-glass-card/45 opacity-70 group transition-all duration-300 hover:opacity-85 select-none h-full">
                  {/* Locked Coming Soon Overlay Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                    <Lock className="size-2.5" />
                    Locked
                  </div>

                  <CardContent className="p-8">
                    <div className="size-12 rounded-xl bg-muted/30 border border-glass-border flex items-center justify-center mb-6 text-muted-foreground">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-foreground/90">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Waitlist Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center max-w-xl mx-auto space-y-6"
        >
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-foreground">Be the first to access AI Layers</h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              Sign up below to secure early beta access. Zero spam, updates only.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl glass border border-glass-border focus:border-accent bg-transparent text-center sm:text-left px-4 w-full"
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
              You are on the list! We'll email you soon.
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
