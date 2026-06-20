"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // Assuming sonner is available or can be added

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGoogleSignup = async () => {
    if (!tosAccepted) {
      toast.error("Please accept the Terms and Conditions to continue.");
      return;
    }
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tosAccepted) {
      toast.error("Please accept the Terms and Conditions to continue.");
      return;
    }
    
    setIsLoading(true);
    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });
      setIsSuccess(true);
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your inbox</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          We sent a magic link to <span className="text-foreground font-bold">{email}</span>. Click it to finish creating your account.
        </p>
        <button onClick={() => setIsSuccess(false)} className="text-accent font-bold text-sm hover:underline">
          Change email address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Join Aivv <span className="text-accent">OS</span></h1>
        <p className="text-muted-foreground text-sm">
          Start your global no-inventory commerce journey.
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center gap-3 transition-all"
          onClick={handleGoogleSignup}
        >
          {/* Using a simple SVG for Google since Github icon is available from lucide */}
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-glass-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-4 text-muted-foreground font-bold tracking-widest">Or with email</span>
        </div>
      </div>

      <form onSubmit={handleMagicLinkSignup} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
          <Input 
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl glass border border-glass-border focus:border-accent bg-transparent transition-all"
            required
          />
        </div>

        <div className="flex items-start space-x-3 bg-muted/20 p-4 rounded-xl border border-glass-border">
          <Checkbox 
            id="tos" 
            checked={tosAccepted}
            onCheckedChange={(checked) => setTosAccepted(checked as boolean)}
            className="mt-1 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white"
          />
          <Label htmlFor="tos" className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none">
            I agree to the <Link href="/terms" className="text-accent font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent font-bold hover:underline">Privacy Policy</Link>. I understand my data will be stored securely.
          </Label>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !tosAccepted}
          className="w-full h-14 rounded-xl accent-gradient text-white font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Get Magic Link
              <Mail className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="text-accent font-bold hover:underline">Sign In</Link>
      </div>
    </div>
  );
}
