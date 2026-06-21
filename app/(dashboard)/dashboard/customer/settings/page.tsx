import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/actions/ai";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function CustomerSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const subscription = await getUserSubscription();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">My Dashboard</h2>
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <SettingsClient user={session.user} subscription={subscription} />
    </div>
  );
}
