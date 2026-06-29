"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileCheck, BarChart3, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

const launchFeatures = [
  {
    title: "US LLC Formation",
    description: "Filed in under 48 hours, all 50 states.",
    icon: Building2,
    details: "✦ US LLC Formation — Filed in under 48 hours, all 50 states"
  },
  {
    title: "EIN & Compliance",
    description: "Registered agent, annual reports, and federal taxes — handled.",
    icon: FileCheck,
    details: "✦ EIN & Compliance — Registered agent, annual reports, and federal taxes — handled"
  },
  {
    title: "Bookkeeping Synced",
    description: "Auto P&Ls tied to your Aivv revenue.",
    icon: BarChart3,
    details: "✦ Bookkeeping Synced — Auto P&Ls tied to your Aivv revenue"
  }
];

export function Launch() {
  return (
    <section id="launch" className="py-24 relative overflow-hidden bg-background border-t border-glass-border">
      {/* Subtle animated gradient glow behind the Launch section hero */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

      {/* Additional blue glows in corners */}
      <div className="absolute right-[-10%] top-[20%] w-[350px] h-[350px] bg-blue-500/[0.04] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute left-[-5%] bottom-[-10%] w-[350px] h-[350px] bg-blue-600/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          >
            <Rocket className="size-3" />
            Launch
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-foreground font-syne tracking-tight"
          >
            Your US business. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-extrabold tracking-tight">From anywhere on Earth.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Form a US LLC, get your EIN, and stay fully compliant — without leaving your Aivv dashboard. Built for founders in Africa, Asia, Latin America, and beyond.
          </motion.p>
        </div>

        {/* Feature Cards Grid (glass-morphism with blue glow) */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {launchFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="glass border border-glass-border hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-gradient-to-b from-[#111827]/80 to-[#0B0F17]/90 transition-all duration-500 h-full group">
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <div>
                    <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all duration-300">
                      <feature.icon className="size-6 text-blue-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-glass-border/30">
                    <span className="text-[11px] font-medium text-blue-400/80">
                      Fully Automated Integration
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-6"
        >
          <Link href="/signup">
            <Button size="lg" className="h-14 px-10 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/25 border-none transition-transform active:scale-95 cursor-pointer flex items-center gap-2 group">
              Get US Business Ready
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <div className="text-xs text-muted-foreground font-semibold text-center">
            ✦ Complete setup within Aivv ✦ No SSN or ITIN required ✦ Bank account ready
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
