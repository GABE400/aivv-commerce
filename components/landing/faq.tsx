"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/container";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Do I need inventory to shop on Aivv?",
    answer: "No. Every storefront order is custom-made on-demand. Every product is printed and shipped directly when you order — no stock, no waiting, and less waste.",
  },
  {
    question: "Can I connect my own fulfillment or dropshipping accounts to sell?",
    answer: "No. Aivv owns and operates the storefront catalog directly. Subscription users get access to use the B2B AI automation workspace to automate their business operations.",
  },
  {
    question: "How does payment processing work?",
    answer: "All transactions on Aivv are processed via Dodo Payments. They handle multi-currency checkout, global tax compliance, and payouts — so you don't have to think about it.",
  },
  {
    question: "What is the AI Automation platform?",
    answer: "Aivv lets any business — not just ecommerce — connect their own Claude or OpenAI API key and automate their operations. Think customer follow-ups, internal reports, content generation, and more. You bring the API key, we provide the workflows.",
  },
  {
    question: "Do I need to be technical to use the automation?",
    answer: "No. Aivv provides pre-built workflows you can activate in minutes. For businesses in Zambia, we also offer in-person setup — we'll come to you.",
  },
  {
    question: "Where is Aivv available?",
    answer: "The AI automation platform and POD store are available globally. In-person setup sessions are currently available in Lusaka and surrounding areas.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. All automation plans are month-to-month with no contracts or lock-in.",
  },
  {
    question: "How is Aivv different from Shopify or other platforms?",
    answer: "Aivv is not just a store builder. It combines a done-for-you POD store with a business automation platform powered by your own AI API keys. One system, two revenue models.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-background border-t border-glass-border">
      {/* Background glow highlights */}
      <div className="absolute right-0 bottom-[-10%] w-[500px] h-[500px] bg-accent/3 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute left-[-10%] top-[-10%] w-[400px] h-[400px] bg-purple-500/3 blur-[125px] rounded-full pointer-events-none" />

      <Container className="max-w-4xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass text-[10px] font-bold text-accent uppercase tracking-wider mb-6">
            <HelpCircle className="size-3" />
            Help Desk
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 text-foreground font-syne"
          >
            Frequently asked <span className="text-gradient">questions</span>
          </motion.h2>
        </div>

        {/* FAQ Items Accordion list */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "border border-glass-border bg-glass-card/30 rounded-2xl overflow-hidden transition-all duration-300",
                  isOpen ? "border-accent/40 bg-gradient-to-r from-accent/[0.02] to-transparent shadow-md shadow-accent/5" : "hover:border-glass-border/80"
                )}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left group cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className={cn(
                    "text-base md:text-lg pr-4 font-semibold transition-colors duration-300", 
                    isOpen ? "text-accent" : "text-foreground/90 group-hover:text-foreground"
                  )}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 text-muted-foreground shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180 text-accent"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm md:text-base text-muted-foreground leading-relaxed border-t border-glass-border/30">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
