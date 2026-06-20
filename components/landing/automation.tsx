"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Zap, Users } from "lucide-react";

const automationFeatures = [
  {
    title: "Bring Your Own API Key",
    description: "Connect Claude, OpenAI, or Gemini. You control the AI, we build the workflows.",
    icon: Key,
  },
  {
    title: "Pre-built Workflow Library",
    description: "Launch with ready-made automations for sales, support, content, and operations.",
    icon: Zap,
  },
  {
    title: "Local Setup Available",
    description: "Based in Zambia? We'll visit your business and set everything up for you in person.",
    icon: Users,
  },
];

export function Automation() {
  return (
    <section id="automation" className="py-24 relative overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-accent/5 dark:bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-foreground font-syne"
          >
            Run your business on <span className="text-gradient">autopilot.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Connect your Claude or OpenAI API key and automate any part of your operation — 
            from customer follow-ups to internal reports. Works for any business, any industry.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {automationFeatures.map((feature, index) => (
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
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Local Setup Consultation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="relative overflow-hidden border-l-4 border-l-accent border-y border-r border-glass-border bg-glass-card bg-gradient-to-r from-accent/[0.03] to-transparent hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 group transition-all duration-300">
            {/* Background glow */}
            <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-accent/10 transition-all duration-500" />
            
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-wider">
                  On-Site Consultation
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                  Not sure where to start?
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  We offer on-site setup for businesses in Lusaka and surrounding areas.
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-start md:justify-end">
                <Button className="h-12 px-6 font-bold accent-gradient text-white shadow-xl shadow-accent/20 rounded-xl transition-transform active:scale-95 cursor-pointer">
                  Book a Setup Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
