"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfileSettingsAction } from "@/lib/actions/users";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SettingsClientProps {
  user: any;
  subscription: any;
}

export function SettingsClient({ user, subscription }: SettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [isPending, startTransition] = useTransition();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") {
      toast.error("Name cannot be empty.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateProfileSettingsAction({ name });
        if (res.success) {
          toast.success("Profile updated successfully!");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update profile.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Form Card */}
      <div className="p-6 rounded-2xl glass border border-glass-border space-y-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="size-5 text-accent" />
            Profile Details
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Update your display name and view account info.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl glass border border-glass-border focus:border-accent bg-transparent transition-all"
                placeholder="Enter your name"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="h-11 rounded-xl glass border border-glass-border bg-muted/20 text-muted-foreground/60 cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="accent-gradient text-white font-bold rounded-xl h-10 px-6 shadow-md shadow-accent/15 gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Subscription Card */}
      <div className="p-6 rounded-2xl glass border border-glass-border space-y-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            Active Subscription
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Review subscription and features associated with your account.</p>
        </div>

        {subscription ? (
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm uppercase tracking-wider">
                  {subscription.plan} License
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {subscription.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Your commerce automation templates are active. High capacity backend runs on autopilot.
              </p>
            </div>
            
            <Link href="/dashboard/customer/automate">
              <Button size="sm" className="glass border-glass-border hover:bg-glass-highlight font-bold rounded-xl">
                Manage Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-muted/10 border border-glass-border/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-foreground text-sm uppercase tracking-wider">
                Shopper / Free Account
              </span>
              <p className="text-xs text-muted-foreground">
                Upgrade to launch your e-commerce operations, sync supplier catalogs, and trigger AI automation tasks.
              </p>
            </div>
            
            <Link href="/dashboard/customer/automate">
              <Button size="sm" className="accent-gradient text-white font-bold rounded-xl shadow-md shadow-accent/15">
                Upgrade Account
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Security Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API Credentials Shortcut */}
        <div className="p-6 rounded-2xl glass border border-glass-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <Key className="size-4 text-accent" />
              API Key Management
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Store, encrypt, and check connection validity of custom credentials for OpenAI, Anthropic, Gemini, DeepSeek, and Groq.
            </p>
          </div>
          
          <Link href="/dashboard/customer/automate/keys" className="w-full">
            <Button variant="outline" className="w-full h-10 rounded-xl glass border-glass-border hover:bg-glass-highlight font-bold text-xs">
              Manage Credentials &rarr;
            </Button>
          </Link>
        </div>

        {/* Consent Info */}
        <div className="p-6 rounded-2xl glass border border-glass-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <ShieldCheck className="size-4 text-accent" />
              Legal & Consent Logs
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Review current configuration records of user policies and document consents accepted.
            </p>
          </div>

          <div className="space-y-2 font-mono text-[10px] text-muted-foreground p-3.5 rounded-xl bg-muted/20 border border-glass-border/30">
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" />
              <span>Terms of Service: Accepted</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Check className="size-3.5 text-emerald-500" />
              <span>Privacy Policy: Accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
