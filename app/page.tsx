import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { DeveloperSection } from "@/components/landing/developer-section";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { AIWorkflows } from "@/components/landing/ai-workflows";
import { Automation } from "@/components/landing/automation";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        <Hero />
        <SocialProof />
        <Automation />
        <ProductShowcase />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <AIWorkflows />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </div>
      <Footer />
    </main>
  );
}
