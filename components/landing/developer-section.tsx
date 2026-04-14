"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Terminal } from "lucide-react";

export function DeveloperSection() {
  const codeSnippet = `// Production-ready E-commerce OS
import { createStore } from "aivv-commerce-os";

const system = await createStore({
  provider: "dodo-payments",
  database: "neon",
  auth: "better-auth",
  suppliers: ["print-on-demand", "dropshipping"]
});

// Fully type-safe & scalable
await system.launch();`;

  return (
    <section className="py-24 bg-muted/30 border-y border-glass-border">
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center space-x-2 text-accent font-mono text-sm px-3 py-1 rounded-full bg-accent/5 dark:bg-accent/10 border border-accent/20">
              <Terminal className="size-4" />
              <span>Developer-First Infrastructure</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
              Built on the <span className="text-gradient">modern stack.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We've handled the architecture so you can focus on scale. 
              Next.js 16 + Drizzle ORM + NeonDB + Better Auth + Dodo Payments.
            </p>
            
            <ul className="space-y-4">
              {[
                "Fully type-safe architecture",
                "Global scalability by default",
                "Built-in supplier abstraction",
                "Production-ready auth & payments",
              ].map((item) => (
                <li key={item} className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors">
                  <div className="size-1.5 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-[1px] rounded-2xl bg-gradient-to-br from-foreground/20 via-foreground/5 to-transparent"
            >
              <div className="bg-[#0D1117] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/5">
                  <div className="flex space-x-2">
                    <div className="size-3 rounded-full bg-red-500/50" />
                    <div className="size-3 rounded-full bg-amber-500/50" />
                    <div className="size-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="text-xs text-[#8B949E] font-mono">init-system.ts</div>
                </div>
                <div className="p-8">
                  <pre className="font-mono text-sm md:text-base leading-relaxed text-[#C9D1D9]">
                    <code>
                      {codeSnippet.split("\n").map((line, i) => (
                        <div key={i} className="flex">
                          <span className="w-8 text-[#484F58] select-none">{i + 1}</span>
                          <span className={cn(
                            line.startsWith("//") ? "text-[#8B949E] italic" : 
                            line.includes("const") ? "text-[#FF7B72]" : 
                            line.includes("await") ? "text-[#79C0FF]" : 
                            "text-[#C9D1D9]"
                          )}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
              
              {/* Decoration */}
              <div className="absolute -bottom-10 -right-10 size-40 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Helper for conditional classes if not imported correctly
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
