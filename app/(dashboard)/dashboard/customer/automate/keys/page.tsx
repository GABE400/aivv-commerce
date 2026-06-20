import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserApiKeys } from "@/lib/actions/ai";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import KeyManagerClient from "./key-manager-client";

export default async function KeysPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const keys = await getUserApiKeys();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/customer/automate" 
          className="p-2 rounded-lg bg-glass border border-glass-border hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Manage API Keys
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure and validate your custom API keys for workflow execution.</p>
        </div>
      </div>

      <KeyManagerClient initialKeys={keys} />
    </div>
  );
}
