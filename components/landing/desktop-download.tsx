"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import Image from "next/image";

export function DesktopDownload() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#1A1F35] border-t border-glass-border text-foreground">
      {/* Background glow highlights */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute right-10 top-10 w-72 h-72 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-xs font-medium text-accent mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span>Desktop App — Powered by Tauri</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-syne">
                Take Aivv with you. <span className="text-gradient">Everywhere.</span>
              </h2>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                The Aivv business dashboard is available as a native desktop app built with Tauri — lightweight, fast, and secure. Manage your AI workflows, monitor automations, and run your operations from your desktop.
              </p>
            </motion.div>

            {/* Bullets */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {[
                "Built with Tauri — tiny install, no bloat",
                "Runs natively on Windows and macOS",
                "Auto-updates silently in the background",
              ].map((bullet) => (
                <li key={bullet} className="flex items-center space-x-3 text-sm text-gray-300">
                  <span className="flex items-center justify-center size-5 rounded-full bg-indigo-500/10">
                    <svg className="size-3 text-[#8B7FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </motion.ul>

            {/* Tech Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {["✦ Tauri v2", "✦ Next.js", "✦ Rust-powered"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#131627] text-[#8B7FFF] border border-[#2A2F4A]"
                >
                  {tech}
                </span>
              ))}
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => alert("The macOS desktop build is coming soon! (macOS app bundles require compilation on macOS systems).")}
                  className="flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <svg className="size-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.51 12.06 1.005 1.45 2.187 3.078 3.766 3.014 1.524-.065 2.1-.987 3.945-.987 1.838 0 2.37.987 3.963.957 1.62-.027 2.666-1.464 3.655-2.91 1.144-1.674 1.615-3.292 1.64-3.379-.03-.015-3.149-1.21-3.18-4.787-.025-2.985 2.443-4.42 2.553-4.484-1.393-2.053-3.548-2.285-4.316-2.336-2.007-.162-3.606 1.078-4.605 1.078zm.512-4.103c.857-1.045 1.433-2.5 1.277-3.95-1.24.05-2.748.825-3.637 1.87-1.12 1.29-1.46 2.766-1.27 4.195 1.39.11 2.77-.55 3.63-2.115z" />
                  </svg>
                  Download for macOS
                </button>
                <a
                  href="/download/aivv-commerce_0.1.3_x64_en-US.msi"
                  download="aivv-commerce_0.1.3_x64_en-US.msi"
                  className="flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-[#0A0E1A] text-white hover:bg-[#060912] border border-indigo-500/30 hover:border-indigo-500/60 transition-colors cursor-pointer"
                >
                  <svg className="size-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.101zM11.25 1.875L24 0v11.55H11.25V1.875zM11.25 12.45H24v11.55l-12.75-1.875V12.45z" />
                  </svg>
                  Download for Windows
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Also available as a web app — no install required.
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Built with Tauri for maximum performance and minimal system footprint.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Desktop Mockup */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-20 pointer-events-none" />

              {/* Main Window mockup */}
              <div className="relative border border-[#2A2F4A] bg-[#0A0E1A] rounded-xl shadow-2xl overflow-hidden h-[400px] grid grid-cols-[180px_1fr]">
                {/* OS style controls */}
                <div className="absolute top-3 left-4 flex space-x-1.5 z-20">
                  <div className="size-2 rounded-full bg-[#FF5F56] opacity-90" />
                  <div className="size-2 rounded-full bg-[#FFBD2E] opacity-90" />
                  <div className="size-2 rounded-full bg-[#27C93F] opacity-90" />
                </div>

                {/* Sidebar */}
                <div className="border-r border-[#2A2F4A] bg-[#121625] pt-10 px-4 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 px-1">
                      <Image
                        src="/logoaivv.svg"
                        alt="Aivv Logo"
                        width={20}
                        height={20}
                        style={{ height: "auto" }}
                        className="rounded"
                      />
                      <span className="font-bold text-xs text-white tracking-wide font-syne">AIVV OS</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { name: "Dashboard", active: false },
                        { name: "Workflows", active: true },
                        { name: "API Keys", active: false },
                        { name: "Orders", active: false },
                        { name: "Settings", active: false }
                      ].map((item) => (
                        <div
                          key={item.name}
                          className={`px-2 py-1.5 rounded text-[10px] font-medium transition-colors ${
                            item.active
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "text-gray-400 hover:bg-muted/30 hover:text-white"
                          }`}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Subtle Tauri watermark label */}
                  <div className="pb-4 text-[9px] text-muted-foreground font-medium">
                    Powered by Tauri
                  </div>
                </div>

                {/* Content Pane */}
                <div className="flex flex-col overflow-hidden bg-[#0A0E1A] h-full">
                  <header className="h-10 border-b border-[#2A2F4A] flex items-center justify-between px-6 bg-[#0E1224]">
                    <h3 className="text-[10px] font-semibold text-white">Active Workflows</h3>
                    <div className="flex items-center space-x-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                      </span>
                      <span className="text-[8px] text-emerald-400 font-bold uppercase">System Live</span>
                    </div>
                  </header>

                  <div className="p-4 space-y-3 overflow-y-auto">
                    {/* Workflow status rows */}
                    {[
                      { name: "Daily Sales Summary", provider: "Claude 3.5 Sonnet", time: "10m ago" },
                      { name: "Customer Auto-Responder", provider: "Groq (Llama 3.3)", time: "2m ago" },
                      { name: "Supplier Inventory Mapper", provider: "GPT-4o", time: "1h ago" }
                    ].map((flow) => (
                      <div key={flow.name} className="p-2.5 rounded-lg border border-[#2A2F4A] bg-[#121625] flex justify-between items-center text-[10px]">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white">{flow.name}</div>
                          <div className="text-gray-400 text-[9px]">{flow.provider}</div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-bold">
                            Active
                          </span>
                          <div className="text-muted-foreground text-[8px]">{flow.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
