"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0E1224] text-foreground flex flex-col justify-between selection:bg-purple-500/30 selection:text-white">
      {/* Header */}
      <header className="h-20 flex items-center px-8 border-b border-glass-border">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20">A</div>
            <span className="text-lg font-bold text-white font-syne">Aivv <span className="text-accent">OS</span></span>
          </Link>
          <Link href="/signup" className="text-xs font-bold text-accent hover:underline">
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 md:py-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to storefront
        </Link>

        <div className="glass border border-glass-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-8">
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-syne">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Last Updated: June 22, 2026
            </p>
          </div>

          <div className="relative border-t border-glass-border/30 pt-8 space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">1. Agreement to Terms</h2>
              <p>
                By accessing or using the AIVV (Automated Intelligent Virtual Ventures) storefront, desktop application, or AI workflow automation dashboard (collectively, the "Platform"), you agree to be bound by these Terms of Service. If you do not agree, you must immediately discontinue your use of the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">2. Shopper & Storefront Policies</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Print-on-Demand Fulfillment:</strong> AIVV products are custom printed-on-demand and fulfilled by third-party suppliers (e.g., Printify). By purchasing, you acknowledge that orders are routed immediately to production.
                </li>
                <li>
                  <strong>Refunds & Cancellation:</strong> Because items are custom-made, orders cannot be cancelled, modified, or refunded once placed, unless there is a clear manufacturing defect or shipping damage.
                </li>
                <li>
                  <strong>Shipping & Deliveries:</strong> Delivery timelines are estimates provided by shipping carriers. AIVV is not liable for carrier delays or lost shipments.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">3. Secure Payments</h2>
              <p>
                All financial transactions on our platform (including shopping checkouts and business subscription upgrades) are processed securely through our payment provider, <strong>Dodo Payments</strong>. We do not store or directly handle your credit card credentials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">4. Business Automation & API Usage</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>API Credentials:</strong> Business accounts connecting custom LLM models are responsible for supplying their own API keys (Anthropic, OpenAI, Groq, DeepSeek, etc.). Keys are securely encrypted and processed.
                </li>
                <li>
                  <strong>Responsible AI:</strong> You agree not to configure AI workflows that generate malicious content, spam, illegal material, or violate the acceptable use policies of the underlying AI providers.
                </li>
                <li>
                  <strong>Account Role Upgrades:</strong> Upgrading to a business profile grants you access to supplier tools and automated pipelines. The Free Business tier is subject to usage limit caps.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">5. Limitation of Liability</h2>
              <p>
                AIVV provides the Platform "as is." We make no representations or warranties regarding uptime, AI model accuracy, or automated workflow performance. In no event shall AIVV be liable for loss of profits, system errors, or customer service disputes arising from automation runs.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-20 flex items-center justify-center border-t border-glass-border px-8 text-xs text-muted-foreground bg-[#0A0E1A]">
        © 2026 Automated Intelligent Virtual Ventures. All rights reserved.
      </footer>
    </div>
  );
}
