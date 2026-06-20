"use client";

import { useState } from "react";
import { acceptTermsAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function ShopperTermsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [tosChecked, setTosChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const router = useRouter();

  const handleAgree = async () => {
    setIsLoading(true);
    try {
      const result = await acceptTermsAction();
      if (result.success) {
        toast.success("Terms accepted. Happy shopping!");
        router.push("/shop");
      } else {
        toast.error(result.error || "Failed to save agreement.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Auth Header */}
      <header className="h-20 flex items-center px-8">
        <Link href="/" className="flex items-center space-x-2">
           <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">A</div>
           <span className="text-lg font-bold">Aivv <span className="text-accent">OS</span></span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
           <div className="glass border border-glass-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative space-y-6">
                {/* Small Aivv logo at top */}
                <div className="flex justify-center">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20">A</div>
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-white font-syne">One quick thing</h1>
                  <p className="text-muted-foreground text-sm">
                    Before you start shopping, please agree to our terms.
                  </p>
                </div>

                {/* Scrollable Summary Box */}
                <div className="border border-glass-border rounded-2xl bg-muted/20 p-4">
                  <ScrollArea className="h-40 pr-2">
                    <ul className="list-disc pl-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <li>Aivv is a print-on-demand storefront and AI automation platform</li>
                      <li>As a shopper, you are purchasing products fulfilled by Printify</li>
                      <li>Payments are processed securely via Dodo Payments</li>
                      <li>We do not sell or share your personal data with third parties</li>
                      <li>Orders are non-refundable once sent to production unless there is a defect</li>
                    </ul>
                  </ScrollArea>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 bg-muted/10 p-3 rounded-xl border border-glass-border/50">
                    <Checkbox
                      id="tos"
                      checked={tosChecked}
                      onCheckedChange={(checked) => setTosChecked(checked as boolean)}
                      className="mt-1 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white animate-none"
                    />
                    <Label htmlFor="tos" className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none">
                      I have read and agree to the <Link href="/terms" className="text-accent font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent font-bold hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 bg-muted/10 p-3 rounded-xl border border-glass-border/50">
                    <Checkbox
                      id="age"
                      checked={ageChecked}
                      onCheckedChange={(checked) => setAgeChecked(checked as boolean)}
                      className="mt-0.5 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white animate-none"
                    />
                    <Label htmlFor="age" className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none">
                      I am at least 18 years old
                    </Label>
                  </div>
                </div>

                {/* Button */}
                <div className="space-y-4 text-center">
                  <Button
                    onClick={handleAgree}
                    disabled={isLoading || !tosChecked || !ageChecked}
                    className="w-full h-12 rounded-xl accent-gradient text-white font-bold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Agree & Start Shopping
                      </>
                    )}
                  </Button>

                  {/* Link below button */}
                  <div>
                    <Link href="/terms" className="text-xs text-muted-foreground hover:text-accent font-bold hover:underline transition-colors">
                      Read full Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-20 flex items-center justify-center px-8 text-xs text-muted-foreground">
        © 2026 Automated Intelligent Virtual Ventures. All rights reserved.
      </footer>
    </div>
  );
}
