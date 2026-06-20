import { Suspense } from "react";
import { getUserSubscription } from "@/lib/actions/ai";
import AutomateUpgradePage from "./upgrade-form";
import { Loader2, LayoutDashboard, Settings, Key, Zap, List } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AutomatePage() {
  const subscription = await getUserSubscription();

  if (!subscription || subscription.status !== "active") {
    return <AutomateUpgradePage />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Automation Console</h1>
        <p className="text-muted-foreground mt-2">Manage your active workflows, API keys, and monitor usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Info */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle className="text-lg">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <Badge variant="secondary" className="uppercase">{subscription.plan}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{subscription.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/dashboard/customer/automate/keys" className="block">
          <Card className="glass border-glass-border hover:border-accent transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full gap-2">
              <div className="p-3 bg-accent/10 rounded-full">
                <Key className="size-6 text-accent" />
              </div>
              <div className="font-semibold mt-2">Manage API Keys</div>
              <div className="text-xs text-muted-foreground">Add or update provider keys</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/customer/automate/history" className="block">
          <Card className="glass border-glass-border hover:border-accent transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full gap-2">
              <div className="p-3 bg-accent/10 rounded-full">
                <List className="size-6 text-accent" />
              </div>
              <div className="font-semibold mt-2">Execution History</div>
              <div className="text-xs text-muted-foreground">View logs and token usage</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="size-5 text-accent" />
          Active Workflows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/customer/automate/product-copy">
             <Card className="glass border-glass-border hover:border-accent transition-colors cursor-pointer">
               <CardHeader>
                 <CardTitle className="text-lg">Product Copywriter</CardTitle>
                 <CardDescription>Generate item names, titles, and SEO meta tags.</CardDescription>
               </CardHeader>
               <CardContent>
                 <Badge variant="outline">Configured</Badge>
               </CardContent>
             </Card>
          </Link>
          <Link href="/dashboard/customer/automate/email-responder">
             <Card className="glass border-glass-border hover:border-accent transition-colors cursor-pointer">
               <CardHeader>
                 <CardTitle className="text-lg">Email Auto-Responder</CardTitle>
                 <CardDescription>Handles shipment notifications and buyer tracking support.</CardDescription>
               </CardHeader>
               <CardContent>
                 <Badge variant="outline">Configured</Badge>
               </CardContent>
             </Card>
          </Link>
          <Link href="/dashboard/customer/automate/inventory-sync">
             <Card className="glass border-glass-border hover:border-accent transition-colors cursor-pointer">
               <CardHeader>
                 <CardTitle className="text-lg">Inventory Mapping</CardTitle>
                 <CardDescription>Correlates Printify product options to local variants.</CardDescription>
               </CardHeader>
               <CardContent>
                 <Badge variant="outline">Configured</Badge>
               </CardContent>
             </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
