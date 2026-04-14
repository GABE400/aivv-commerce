"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden text-center bg-background">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-accent/5 dark:bg-accent/[0.02] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-accent/10 dark:bg-accent/20 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
      
      <Container className="relative z-10 transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass p-12 md:p-24 rounded-3xl border border-glass-border shadow-2xl"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-foreground">
            Stop building stores. <br />
            <span className="text-gradient">Start building systems.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the automated e-commerce revolution. Launch your global operating system today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-16 px-12 text-lg">
              Launch Your System
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-12 text-lg border-glass-border">
              Talk to an Expert
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
