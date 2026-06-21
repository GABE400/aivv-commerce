"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Last Updated: June 22, 2026
            </p>
          </div>

          <div className="relative border-t border-glass-border/30 pt-8 space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">1. Information We Collect</h2>
              <p>
                At AIVV, we collect information to fulfill storefront orders, authenticate users, and run custom AI workflows. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Account Data:</strong> Full name, email address, and billing information collected via our auth client.
                </li>
                <li>
                  <strong>Storefront & Delivery Data:</strong> Shipping addresses, customer emails, and phone numbers required for order delivery and tracking.
                </li>
                <li>
                  <strong>AI Configuration Data:</strong> Encrypted API keys supplied for task execution. Keys are stored using AES-GCM-256 local-key database encryption.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">2. How We Use Information</h2>
              <p>
                We use collected information strictly to provide storefront fulfillment, system tracking, and workflow automation. Specifically:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Order parameters and shipping details are routed to fulfillment providers (Printify, CJ Dropshipping) to print and deliver purchases.</li>
                <li>Subscription checkouts are processed directly and securely by our billing vendor, Dodo Payments.</li>
                <li>Encrypted API keys are decrypted only during active server workflow runs to make API calls to your selected model providers. We never share your API keys or expose them in client webviews.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">3. Data Security & Storage</h2>
              <p>
                We execute standard database encryption, secure HTTPS tunnels, and authorization session tokens via Better Auth. Access to supplier and buyer data is restricted strictly. We do not sell or lease user contact info or transactional data to third-party ad brokers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">4. Third-Party Integrations</h2>
              <p>
                AIVV integrates directly with third-party networks for automated pipelines. These include Printify, CJ Dropshipping, Dodo Payments, and AI model networks (Anthropic, OpenAI, Groq, Google, DeepSeek). Each service governs data according to its respective privacy policies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white font-syne">5. User Control & Deletion</h2>
              <p>
                You retain full control over your data. You may update your user profile, connect/disconnect API keys, or request full account deletion through the Account Settings dashboard. Account deletion permanently erases active workflows, keys, and account records from our databases.
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
