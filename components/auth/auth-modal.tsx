"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGoogleAuth = async () => {
    if (mode === "signup" && !tosAccepted) {
      toast.error("Please accept the Terms and Conditions to continue.");
      return;
    }

    const callbackURL = mode === "signup" 
      ? (() => {
          const params = new URLSearchParams();
          if (name.trim()) params.set("name", name.trim());
          if (businessName.trim()) params.set("businessName", businessName.trim());
          if (useCase) params.set("useCase", useCase);
          const queryString = params.toString();
          return queryString ? `/onboarding?${queryString}` : "/onboarding";
        })()
      : "/auth-callback";

    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "signup") {
      if (!tosAccepted) {
        toast.error("Please accept the Terms and Conditions to continue.");
        return;
      }
      if (!name.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
      if (!useCase) {
        toast.error("Please select how you will use Aivv.");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        const params = new URLSearchParams();
        params.set("name", name.trim());
        if (businessName.trim()) {
          params.set("businessName", businessName.trim());
        }
        params.set("useCase", useCase);
        const callbackURL = `/onboarding?${params.toString()}`;

        await authClient.signIn.magicLink({
          email,
          name: name.trim(),
          callbackURL,
        });
      } else {
        await authClient.signIn.magicLink({
          email,
          callbackURL: "/auth-callback",
        });
      }
      setIsSuccess(true);
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      // Reset state on close
      setIsSuccess(false);
      setEmail("");
      setName("");
      setBusinessName("");
      setUseCase("");
      setTosAccepted(false);
      setMode("login");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[420px] p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl font-bold">
            {mode === "login" ? "Welcome back to Aivv" : "Create your Aivv account"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === "login"
              ? "Sign in to manage your automations, orders, and settings."
              : "Automate your business or shop our store — one account for everything."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a magic link to <span className="text-foreground font-bold">{email}</span>. Click it to finish signing in.
            </p>
            <Button 
              variant="ghost" 
              className="mt-4 text-xs font-bold text-accent hover:underline hover:bg-transparent" 
              onClick={() => setIsSuccess(false)}
            >
              Try another email
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl glass border border-glass-border hover:bg-glass-highlight gap-3"
              onClick={handleGoogleAuth}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-glass-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">Or with email</span>
              </div>
            </div>

            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="modal-name" className="text-xs uppercase font-bold tracking-wider text-muted-foreground ml-1">Full Name</Label>
                  <Input
                    id="modal-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl glass border-glass-border bg-transparent h-10 px-3 transition-all"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="modal-email" className="text-xs uppercase font-bold tracking-wider text-muted-foreground ml-1">Email Address</Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl glass border-glass-border bg-transparent h-10 px-3 transition-all"
                  required
                />
              </div>

              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="modal-businessName" className="text-xs uppercase font-bold tracking-wider text-muted-foreground ml-1">Business Name</Label>
                    <Input
                      id="modal-businessName"
                      type="text"
                      placeholder="Your company or store name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="rounded-xl glass border-glass-border bg-transparent h-10 px-3 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground ml-1">How will you use Aivv?</Label>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { id: "automate", label: "Automate my business with AI" },
                        { id: "shop", label: "Shop / buy products" },
                        { id: "both", label: "Both" }
                      ].map((option) => {
                        const isSelected = useCase === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setUseCase(option.id)}
                            className={`relative w-full p-4 rounded-xl text-left text-sm cursor-pointer flex items-center justify-between select-none outline-none transition-all ${
                              isSelected 
                                ? "bg-[#1E2440] border-2 border-[#5B4FE8] shadow-[0_0_0_3px_rgba(91,79,232,0.3)]" 
                                : "bg-[#1A1F35] border border-[#2A2F4A] hover:bg-[#1E2440] hover:border-[#5B4FE8] hover:shadow-[0_0_0_2px_rgba(91,79,232,0.2)]"
                            }`}
                            style={{
                              transition: "all 0.15s ease"
                            }}
                          >
                            <span className="font-semibold text-white pr-8 leading-tight">{option.label}</span>
                            {isSelected && (
                              <div className="absolute top-2 right-2 text-[#5B4FE8]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 bg-muted/20 p-4 rounded-xl border border-glass-border">
                    <Checkbox
                      id="modal-tos"
                      checked={tosAccepted}
                      onCheckedChange={(checked) => setTosAccepted(checked as boolean)}
                      className="mt-1 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white"
                    />
                    <Label htmlFor="modal-tos" className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none">
                      I have read and agree to the <Link href="/terms" className="text-accent font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent font-bold hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={isLoading || (mode === "signup" && !tosAccepted)}
                className="w-full h-12 rounded-xl accent-gradient text-white font-bold transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In with Magic Link" : "Create Account"}
                    <Mail className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm pt-2">
              {mode === "login" ? (
                <>
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setIsSuccess(false);
                    }}
                    className="text-accent font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setIsSuccess(false);
                    }}
                    className="text-accent font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
