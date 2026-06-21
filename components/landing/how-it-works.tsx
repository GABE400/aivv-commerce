"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/container";
import { Key, Zap, Users, Activity, ShoppingBag, CreditCard, Truck, Mail } from "lucide-react";

const businessSteps = [
  {
    title: "Start free or bring your key",
    description: "New users get 10 free runs powered by Groq instantly. Connect your own Claude, OpenAI, or Gemini key anytime to unlock full power.",
    icon: Key,
  },
  {
    title: "Choose your workflows",
    description: "Pick from the library or build custom ones",
    icon: Zap,
  },
  {
    title: "We set it up",
    description: "Remote or in-person setup for local clients",
    icon: Users,
  },
  {
    title: "Your business runs",
    description: "Automations handle the repetitive work for you",
    icon: Activity,
  },
];

const shopperSteps = [
  {
    title: "Browse the catalog",
    description: "Find products from our print-on-demand store",
    icon: ShoppingBag,
  },
  {
    title: "Place your order",
    description: "Checkout securely via Dodo Payments",
    icon: CreditCard,
  },
  {
    title: "We handle fulfillment",
    description: "Printify produces and ships your order",
    icon: Truck,
  },
  {
    title: "Track your delivery",
    description: "Automated updates sent to your inbox",
    icon: Mail,
  },
];

type FlowTab = "businesses" | "shoppers";

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<FlowTab>("businesses");
  const steps = activeTab === "businesses" ? businessSteps : shopperSteps;

  return (
    <section id="how-it-works" className="py-24 bg-muted/30 border-y border-glass-border">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 text-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Automation at every step.</h2>
          <p className="text-lg text-muted-foreground">
            Whether you are automating your operation or ordering custom products, Aivv runs a seamless engine in the background.
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center justify-center mb-16 gap-3">
          <button
            onClick={() => setActiveTab("businesses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === "businesses"
                ? "accent-gradient text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                : "glass border border-glass-border text-muted-foreground hover:text-foreground"
            }`}
          >
            For Businesses (AI Automation)
          </button>
          <button
            onClick={() => setActiveTab("shoppers")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === "shoppers"
                ? "accent-gradient text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                : "glass border border-glass-border text-muted-foreground hover:text-foreground"
            }`}
          >
            For Shoppers (POD Store)
          </button>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Connection Line Desktop */}
              <div className="absolute top-10 left-0 w-full h-0.5 bg-gradient-to-r from-accent/10 via-accent/50 to-accent/10 -translate-y-1/2 hidden lg:block" />
              
              <div className="grid lg:grid-cols-4 gap-8 lg:gap-4">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="relative flex flex-col items-center text-center group"
                  >
                    <div className="size-20 rounded-2xl bg-glass border border-glass-border shadow-sm flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 group-hover:border-accent transition-all duration-300">
                      <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
                      <step.icon className="size-8 text-accent" />
                      
                      {/* Step Number */}
                      <div className="absolute -top-2 -right-2 size-6 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-white shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed px-4">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
