"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ChevronRight, ArrowRight, Zap, CheckCircle2, ShieldCheck, Terminal, TrendingUp } from "lucide-react";

export function Hero() {

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-30 dark:opacity-20 blur-[120px] pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/20 dark:bg-accent/40 animate-pulse-slow" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/20 dark:bg-blue-600/30 animate-pulse-slow" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Column B2B Copy */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-xs font-medium text-accent mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span>Aivv Platform v1.0</span>
                <ChevronRight className="size-3" />
              </div>
              
              <h1 className="text-5xl md:text-7.5xl font-bold tracking-tight mb-6 leading-[1.05] text-foreground font-syne">
                Start. Automate. <br />
                <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-extrabold tracking-tight">Run your business — from anywhere.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Aivv gives founders the tools to automate their operations, build AI workflows, and sell worldwide — all from one dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full font-bold flex items-center justify-center gap-2 rounded-2xl h-14 px-8 accent-gradient border-none text-white shadow-xl shadow-accent/20 active:scale-95 transition-all">
                    Start Free
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                {/* <a href="#launch" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full font-bold border-glass-border rounded-2xl h-14 px-8 hover:bg-muted/50 transition-all text-foreground">
                    Form Your US LLC →
                  </Button>
                </a> */}{/* TODO: Re-enable when US Business Launch is ready */}
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full font-bold border-glass-border rounded-2xl h-14 px-8 hover:bg-muted/50 transition-all text-foreground">
                    Visit the Shop →
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium border-t border-glass-border/20 pt-6">
                <span>✦ AI Workflow Automation</span>
                {/* <span>✦ US Business Formation — 48hrs</span> */}
                <span>✦ 150+ Countries Supported</span>
                <span>✦ BYOK: Claude · OpenAI · Gemini</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column Showcase Panel (B2B Automation Console) */}
          <div className="flex-1 w-full max-w-2xl relative">
            {/* Preview Card Body */}
            <div className="w-full relative glass rounded-3xl border border-glass-border p-6 md:p-8 bg-gradient-to-b from-[#111827]/90 to-[#0B0F17]/95 shadow-2xl hover:border-blue-500/20 transition-colors">
                {/* Console header */}
                <div className="flex items-center justify-between border-b border-glass-border/30 pb-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-foreground">Aivv OS Console</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 text-[10px] font-bold text-blue-400">
                    Telemetry Active
                  </div>
                </div>

                {/* Workflows view content */}
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border border-glass-border bg-glass-card/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Zap className="size-3.5 text-accent" />
                          Workflow: Sync Store Ledger
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                          Fired (1m ago)
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                          <span className="text-muted-foreground">Trigger:</span>
                          <span className="font-semibold text-foreground">Webhook (order.created)</span>
                        </div>
                        <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                          <span className="text-muted-foreground">AI Agent:</span>
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            Process & Fulfill Order <CheckCircle2 className="size-3 text-emerald-400" />
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                          <span className="text-muted-foreground">Accounting Action:</span>
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            Update Bookkeeping (+ $189.00) <CheckCircle2 className="size-3 text-emerald-400" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Terminal Logger View */}
                    <div className="bg-[#070913] rounded-xl p-4 border border-glass-border/30 font-mono text-[11px] leading-relaxed text-slate-300">
                      <div className="flex items-center justify-between border-b border-glass-border/10 pb-2 mb-2 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="size-3" />
                          <span>logger_daemon.sh</span>
                        </div>
                        <span>10.14.06 UTC</span>
                      </div>
                      <div className="space-y-1">
                        <div><span className="text-slate-500">[10:14:02]</span> <span className="text-blue-400">INFO:</span> Webhook verified from customer-shop.</div>
                        <div><span className="text-slate-500">[10:14:03]</span> <span className="text-blue-400">INFO:</span> Triggering Claude 3.5 Sonnet agent...</div>
                        <div><span className="text-slate-500">[10:14:05]</span> <span className="text-emerald-400">SUCCESS:</span> Order fulfilled and tracking generated.</div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-slate-500">[10:14:06]</span> <span className="text-emerald-400">SUCCESS:</span> Auto P&L bookkeeping synced to DB.
                          <span className="inline-block w-1.5 h-3 bg-blue-500 ml-1 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

            {/* B2B Floating Stats Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 right-0 lg:-right-6 glass p-4 rounded-xl border border-glass-border shadow-2xl hidden md:block z-20"
            >
              <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Automation Telemetry</div>
              <div className="text-xl font-bold text-foreground">99.9% Success</div>
              <div className="text-[10px] text-emerald-500 font-medium">1,240 runs active</div>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 left-0 lg:-left-10 glass p-4 rounded-xl border border-glass-border shadow-2xl hidden md:block z-20"
            >
              <div className="flex items-center space-x-3">
                <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="size-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Revenue Today</div>
                  <div className="text-sm font-semibold text-foreground">+$2,480.00</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
