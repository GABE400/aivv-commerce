import { db } from "@/lib/db";
import { userWorkflows, workflowTemplates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronLeft, Play, Settings } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function WorkflowExecutionPage({ params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Fetch the template
  const templates = await db.select().from(workflowTemplates).where(eq(workflowTemplates.slug, params.slug)).limit(1);
  if (!templates.length) return <div>Workflow template not found.</div>;
  const template = templates[0];

  // Fetch user's workflow configuration
  const uws = await db.select()
    .from(userWorkflows)
    .where(and(eq(userWorkflows.userId, session.user.id), eq(userWorkflows.templateId, template.id)))
    .limit(1);
    
  const uw = uws[0];

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
            {template.name}
            {uw?.status === "active" ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Not Configured</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="size-4 text-accent" />
                Run Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uw?.status !== "active" ? (
                <div className="text-sm text-muted-foreground p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  This workflow is not fully configured. Please ensure you have mapped a model and provided the necessary API keys in your settings.
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 bg-muted/20 border border-glass-border rounded-lg">
                  Execution UI is currently being wired up to the API. Check back soon for the interactive playground.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="size-4 text-muted-foreground" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Provider</div>
                <div className="text-sm font-medium capitalize">{uw?.provider || "None"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Model</div>
                <div className="text-sm font-medium">{uw?.model || "None"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
