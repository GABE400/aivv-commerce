"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { acceptTermsAction } from "@/lib/actions/users";
import { toast } from "sonner";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Setting up your account...");

  useEffect(() => {
    async function runOnboarding() {
      try {
        // Automatically accept terms because the user checked T&C on the signup form
        const result = await acceptTermsAction();
        if (result.success) {
          const useCase = searchParams.get("useCase");
          if (useCase === "shop") {
            toast.success("Welcome to Aivv! Redirecting to shop...");
            router.push("/shop");
          } else if (useCase === "automate" || useCase === "both") {
            const businessName = searchParams.get("businessName") || "";
            const name = searchParams.get("name") || "";
            toast.success("Welcome to Aivv! Redirecting to setup...");
            router.push(`/dashboard/customer/automate?businessName=${encodeURIComponent(businessName)}&name=${encodeURIComponent(name)}`);
          } else {
            toast.success("Welcome to Aivv! Redirecting to dashboard...");
            router.push("/dashboard/user");
          }
        } else {
          setStatus("Failed to complete onboarding. Please try again.");
          toast.error(result.error || "Failed to save agreement.");
        }
      } catch (err) {
        setStatus("An error occurred during onboarding.");
        toast.error("Something went wrong.");
      }
    }

    runOnboarding();
  }, [searchParams, router]);

  return (
    <div className="relative space-y-4">
      <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold mx-auto animate-pulse">A</div>
      <p className="text-sm font-medium text-muted-foreground">{status}</p>
    </div>
  );
}

export default function OnboardingEntryPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass border border-glass-border rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <Suspense fallback={
          <div className="relative space-y-4">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold mx-auto animate-pulse">A</div>
            <p className="text-sm font-medium text-muted-foreground">Loading onboarding...</p>
          </div>
        }>
          <OnboardingContent />
        </Suspense>
      </div>
    </div>
  );
}
