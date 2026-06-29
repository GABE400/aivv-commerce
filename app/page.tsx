import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { DesktopDownload } from "@/components/landing/desktop-download";
import { DeveloperSection } from "@/components/landing/developer-section";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Sell } from "@/components/landing/sell";
import { AIWorkflows } from "@/components/landing/ai-workflows";
import { Automation } from "@/components/landing/automation";
// import { Launch } from "@/components/landing/launch"; // TODO: Re-enable when US Business Launch is ready
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aivv | AI Business Automation & Global Commerce Platform",
  description: "Automate your business operations with AI-powered workflows. Connect your own Claude, OpenAI, or Gemini key and run custom automations from one dashboard.",
  keywords: [
    "AI business automation",
    "Workflow automation",
    "AI workflows",
    "Business operations",
    "Global commerce",
    "Print on demand",
    "Dropshipping automation",
  ],
  openGraph: {
    title: "Aivv | AI Business Automation & Global Commerce Platform",
    description: "Automate your business operations with AI-powered workflows. Connect your own API key and run custom automations from one dashboard.",
  }
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        <Hero />
        <SocialProof />
        <Automation />
        {/* <Launch /> */}{/* TODO: Re-enable when US Business Launch is ready */}
        <Sell />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <DesktopDownload />
        <AIWorkflows />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </div>
      <Footer />
    </main>
  );
}
