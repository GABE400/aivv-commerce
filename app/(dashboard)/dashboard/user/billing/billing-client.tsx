"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Download, 
  Trash2, 
  Check, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BillingClientProps {
  user: any;
  subscription: any;
}

const plansList = [
  { id: "starter", name: "Starter", price: "$29" },
  { id: "growth", name: "Growth", price: "$79" },
  { id: "agency", name: "Agency", price: "$199" },
];

export function BillingClient({ user, subscription }: BillingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Component States (Stateful demo for full interactivity)
  const [currentPlan, setCurrentPlan] = useState<string>(
    subscription?.plan 
      ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
      : "Free"
  );
  
  const [planStatus, setPlanStatus] = useState<string>(
    subscription ? (subscription.status === "active" ? "Active" : subscription.status) : "Free"
  );

  const [paymentMethod, setPaymentMethod] = useState({
    brand: "Visa",
    last4: "4242",
    expiry: "08/28",
  });

  const [billingHistory, setBillingHistory] = useState([
    { date: "Jun 21, 2026", desc: "Growth Plan — Monthly", amount: "$79.00", status: "Paid" },
    { date: "May 21, 2026", desc: "Growth Plan — Monthly", amount: "$79.00", status: "Paid" },
    { date: "Apr 21, 2026", desc: "Starter Plan — Monthly", amount: "$29.00", status: "Paid" },
  ]);

  // Modal Control States
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isUpdateCardOpen, setIsUpdateCardOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<string>("growth");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleUpgradePlan = (planId: string) => {
    setSelectedPlan(planId);
    setIsUpgradeOpen(true);
  };

  const confirmUpgrade = () => {
    setIsUpgradeOpen(false);
    const planName = plansList.find(p => p.id === selectedPlan)?.name || "Starter";
    const planPrice = plansList.find(p => p.id === selectedPlan)?.price || "$29";
    
    toast.loading("Connecting to Dodo Payments secure portal...", { duration: 1500 });
    
    setTimeout(() => {
      setCurrentPlan(planName);
      setPlanStatus("Active");
      
      // Prepend to billing history
      const newInvoice = {
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        desc: `${planName} Plan — Monthly`,
        amount: `${planPrice}.00`,
        status: "Paid"
      };
      setBillingHistory(prev => [newInvoice, ...prev]);
      
      toast.success(`Successfully upgraded to the ${planName} plan!`);
      router.refresh();
    }, 1500);
  };

  const confirmCancellation = () => {
    setIsCancelOpen(false);
    toast.loading("Processing subscription cancellation...", { duration: 1200 });

    setTimeout(() => {
      setPlanStatus("Cancels on July 21, 2026");
      toast.success("Subscription cancelled successfully. Your plan remains active until July 21, 2026.");
      router.refresh();
    }, 1200);
  };

  const handleUpdateCard = () => {
    setIsUpdateCardOpen(false);
    toast.loading("Redirecting to Dodo Payments secure billing settings...", { duration: 1500 });
    
    setTimeout(() => {
      toast.success("Payment method updated successfully!");
    }, 1500);
  };

  const handleRemoveCard = () => {
    toast.loading("Removing payment method...", { duration: 1000 });
    setTimeout(() => {
      setPaymentMethod({ brand: "", last4: "", expiry: "" });
      toast.success("Payment method removed successfully.");
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleteAccountOpen(false);
    toast.loading("Permanently deleting your account and assets...", { duration: 2000 });
    
    setTimeout(() => {
      toast.success("Account deleted successfully. We hope to see you again!");
      router.push("/");
    }, 2000);
  };

  const isFreePlan = currentPlan === "Free";

  return (
    <div className="space-y-8">
      {/* Free Plan Banner */}
      {isFreePlan && (
        <div className="p-6 rounded-2xl border-l-4 border-l-indigo-500 border-y border-r border-[#2A2F4A] bg-gradient-to-r from-[#1A1F35] to-[#1E2440] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-white font-semibold text-sm md:text-base flex items-center gap-2">
              <span className="text-indigo-400">✦</span> You are on the Free plan — 10 workflow runs/month powered by Groq.
            </p>
          </div>
          <Button 
            onClick={() => handleUpgradePlan("growth")}
            className="h-10 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer w-full md:w-auto transition-all active:scale-95 shrink-0"
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Section 1 — Current Plan */}
      <div 
        style={{ backgroundColor: "#1A1F35", borderColor: "#2A2F4A" }}
        className="rounded-2xl border p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 transition-all"
      >
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current Plan
            </span>
            <div className="flex items-baseline gap-3 mt-1.5">
              <h2 className="text-3xl font-extrabold font-syne text-indigo-400 tracking-tight">
                {currentPlan}
              </h2>
              <span className="text-base text-foreground font-semibold">
                {isFreePlan ? "$0" : currentPlan === "Starter" ? "$29" : currentPlan === "Growth" ? "$79" : "$199"} / month
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            {!isFreePlan && (
              <span className="text-muted-foreground">
                Next billing date: July 21, 2026
              </span>
            )}
            
            {planStatus === "Active" && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-bold tracking-wider">
                Active
              </span>
            )}
            {planStatus.startsWith("Cancels") && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-wider">
                {planStatus}
              </span>
            )}
            {planStatus === "Past Due" && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-wider">
                Past Due
              </span>
            )}
            {isFreePlan && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider">
                Free Tier
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 items-stretch sm:items-center justify-center shrink-0">
          <Button 
            onClick={() => handleUpgradePlan("growth")}
            className="h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-all duration-300 w-full sm:w-auto md:w-full lg:w-auto"
          >
            Upgrade Plan
          </Button>
          
          {!isFreePlan && !planStatus.startsWith("Cancels") && (
            <Button 
              variant="outline"
              onClick={() => setIsCancelOpen(true)}
              className="h-11 px-6 font-bold border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer w-full sm:w-auto md:w-full lg:w-auto"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </div>

      {/* Section 2 — Payment Method */}
      <div 
        style={{ backgroundColor: "#1A1F35", borderColor: "#2A2F4A" }}
        className="rounded-2xl border p-6 md:p-8 space-y-6 bg-[#1A1F35] border-[#2A2F4A]"
      >
        <div>
          <h2 className="text-xl font-bold font-syne text-foreground tracking-tight">Payment Method</h2>
        </div>

        {paymentMethod.last4 ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 rounded-xl border border-glass-border/30 bg-background/30">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-glass border border-glass-border flex items-center justify-center text-foreground font-bold shrink-0">
                <CreditCard className="size-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {paymentMethod.brand} ending in {paymentMethod.last4}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase font-bold tracking-wider">
                    Default
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expires {paymentMethod.expiry}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <Button 
                onClick={() => setIsUpdateCardOpen(true)}
                className="h-10 px-5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer text-xs"
              >
                Update Card
              </Button>
              <Button 
                variant="outline"
                disabled={!isFreePlan && !planStatus.startsWith("Cancels")}
                title={(!isFreePlan && !planStatus.startsWith("Cancels")) ? "Cannot remove card while subscription is active" : ""}
                onClick={handleRemoveCard}
                className="h-10 px-5 font-bold border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Remove Card
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-glass-border/40 text-center text-muted-foreground italic text-sm">
            No payment method added yet. Add a card to purchase plans.
          </div>
        )}
      </div>

      {/* Section 3 — Billing History */}
      <div 
        style={{ backgroundColor: "#1A1F35", borderColor: "#2A2F4A" }}
        className="rounded-2xl border p-6 md:p-8 space-y-6 bg-[#1A1F35] border-[#2A2F4A]"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold font-syne text-foreground tracking-tight">Billing History</h2>
          {!isFreePlan && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toast.success("Exported billing history to CSV.")}
              className="text-xs font-bold text-muted-foreground hover:text-foreground h-9 rounded-lg"
            >
              <Download className="size-3.5 mr-1.5" />
              Export CSV
            </Button>
          )}
        </div>

        {isFreePlan ? (
          <div className="py-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No billing history yet. Upgrade to a paid plan to see your invoices here.
            </p>
            <Button 
              onClick={() => handleUpgradePlan("growth")}
              className="h-10 px-5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer text-xs transition-transform active:scale-95"
            >
              Upgrade Plan
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 md:-mx-8 lg:mx-0">
            <div className="inline-block min-w-full align-middle px-6 md:px-8 lg:px-0">
              <table className="min-w-full divide-y divide-glass-border/30">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 text-left">Date</th>
                    <th className="pb-3 text-left">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/20 text-xs font-medium">
                  {billingHistory.map((row, i) => (
                    <tr key={i} className="text-foreground/90 hover:bg-background/25">
                      <td className="py-3.5 text-muted-foreground whitespace-nowrap">{row.date}</td>
                      <td className="py-3.5 whitespace-nowrap">{row.desc}</td>
                      <td className="py-3.5 text-right whitespace-nowrap font-semibold">{row.amount}</td>
                      <td className="py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <button 
                          onClick={() => toast.success(`Downloading invoice for ${row.date}...`)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 4 — Danger Zone (free users only) */}
      {isFreePlan && (
        <div 
          style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
          className="rounded-2xl border p-6 md:p-8 space-y-6 bg-red-950/5"
        >
          <div>
            <h2 className="text-xl font-bold font-syne text-red-500 tracking-tight">Danger Zone</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.02]">
            <div className="space-y-1 max-w-2xl">
              <h3 className="font-semibold text-sm text-foreground">
                Delete Account
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Permanently delete your Aivv account and all associated data. This cannot be undone.
              </p>
            </div>

            <Button 
              onClick={() => setIsDeleteAccountOpen(true)}
              className="h-10 px-5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer text-xs transition-colors shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </div>
      )}

      {/* ----------------- Modals ----------------- */}

      {/* Upgrade Plan Modal */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="glass border-glass-border text-foreground max-w-2xl w-[92vw] overflow-y-auto max-h-[92vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-syne text-center">Choose a new plan</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Change your automation capacity. Bring your own keys to unlock unlimited execution.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {plansList.map((p) => {
              const isCurrent = currentPlan.toLowerCase() === p.id;
              const isSelected = selectedPlan === p.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => !isCurrent && setSelectedPlan(p.id)}
                  className={cn(
                    "p-5 rounded-2xl border text-center transition-all cursor-pointer select-none flex flex-col justify-between h-44 relative bg-background/25",
                    isCurrent ? "border-glass-border/30 opacity-40 cursor-not-allowed" : "",
                    isSelected && !isCurrent ? "border-indigo-500 ring-2 ring-indigo-500/40" : "border-glass-border hover:border-indigo-500/40"
                  )}
                >
                  {isCurrent && (
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[9px] uppercase font-bold tracking-wider">
                      Current Plan
                    </span>
                  )}
                  <div className="space-y-1 pt-3">
                    <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">{p.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {p.id === "starter" ? "5 workflows" : p.id === "growth" ? "20 workflows" : "Unlimited"}
                    </p>
                  </div>
                  <div className="text-3xl font-extrabold font-syne text-foreground mt-4">
                    {p.price}
                    <span className="text-[10px] font-medium text-muted-foreground uppercase ml-1">/mo</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/25 flex items-start gap-3">
              <Info className="size-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-normal font-medium">
                You will be charged a prorated amount immediately via Dodo Payments.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button 
                onClick={confirmUpgrade}
                className="h-11 w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer"
              >
                Confirm Upgrade
              </Button>
              <button 
                onClick={() => setIsUpgradeOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground text-center py-2 hover:underline"
              >
                Keep current plan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Confirmation Modal */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="glass border-glass-border text-foreground max-w-md w-[92vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-syne text-center text-red-500">Cancel your subscription</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-center">
              Your plan will remain active until the end of your current billing period (**July 21, 2026**). After that your account moves to the **Free plan** — 10 workflow runs/month powered by Groq.
            </p>

            <div className="flex flex-col gap-2.5">
              <Button 
                onClick={confirmCancellation}
                className="h-11 w-full font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Yes, Cancel Subscription
              </Button>
              <button 
                onClick={() => setIsCancelOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground text-center py-2 hover:underline"
              >
                Keep my subscription
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Card Modal */}
      <Dialog open={isUpdateCardOpen} onOpenChange={setIsUpdateCardOpen}>
        <DialogContent className="glass border-glass-border text-foreground max-w-md w-[92vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-syne text-center">Update payment method</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-center">
              You'll be redirected to our secure payment provider to update your card details. Your new card will be charged on your next billing date.
            </p>

            <div className="flex flex-col gap-2.5">
              <Button 
                onClick={handleUpdateCard}
                className="h-11 w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                Continue to Dodo Payments
                <ExternalLink className="size-4" />
              </Button>
              <button 
                onClick={() => setIsUpdateCardOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground text-center py-2 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal (Danger Zone) */}
      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent className="glass border-glass-border text-foreground max-w-md w-[92vw]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-syne text-center text-red-500 flex items-center justify-center gap-2">
              <AlertTriangle className="size-5" />
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-red-400/90 font-medium">
              This action is immediate, final, and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              All active workflows, history, keys, and supplier credentials will be permanently erased.
            </p>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-[10px] font-bold uppercase tracking-wider text-red-400 ml-1">
                Type DELETE to confirm
              </Label>
              <Input
                id="confirm-delete"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="h-11 rounded-xl glass border-red-500/30 focus:border-red-500 bg-transparent text-center font-bold tracking-widest text-red-500"
                placeholder="DELETE"
              />
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE"}
                className="h-11 w-full font-bold bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-lg cursor-pointer"
              >
                Permanently Delete Account
              </Button>
              <button 
                onClick={() => {
                  setIsDeleteAccountOpen(false);
                  setDeleteConfirmText("");
                }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground text-center py-2 hover:underline"
              >
                Cancel and keep account
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
