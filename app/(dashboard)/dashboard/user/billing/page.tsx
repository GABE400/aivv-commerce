import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/actions/ai";
import { BillingClient } from "./billing-client";

export const dynamic = "force-dynamic";

export default async function UserBillingPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const subscription = await getUserSubscription();

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight mb-2">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Manage your plan, payment method, and billing history. All payments are processed securely via Dodo Payments.
        </p>
      </div>

      <BillingClient user={session.user} subscription={subscription} />
    </div>
  );
}
