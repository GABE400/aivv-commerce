import { db } from "@/lib/db";
import { userWorkflows, workflowTemplates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronLeft, Play, Settings } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkflowPlayground } from "./playground-client";
import { ModelSelector } from "@/components/dashboard/automate/model-selector";

export default async function WorkflowExecutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Fetch the template
  const templates = await db.select().from(workflowTemplates).where(eq(workflowTemplates.slug, slug)).limit(1);
  if (!templates.length) return <div className="p-8 text-center text-muted-foreground">Workflow template not found.</div>;
  const template = templates[0];

  // Fetch user's workflow configuration
  let uws = await db.select()
    .from(userWorkflows)
    .where(and(eq(userWorkflows.userId, session.user.id), eq(userWorkflows.templateId, template.id)))
    .limit(1);
    
  let uw = uws[0];

  // Auto-initialize with default Groq configuration if not yet created
  if (!uw) {
    const [newUw] = await db.insert(userWorkflows).values({
      userId: session.user.id,
      templateId: template.id,
      provider: "groq",
      model: "llama-3.3-70b-versatile",
      status: "active",
    }).returning();
    uw = newUw;
  }

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
                <WorkflowPlayground
                  userWorkflowId={uw.id}
                  inputSchemaStr={template.inputSchema || "{}"}
                  outputSchemaStr={template.outputSchema || "{}"}
                />
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
                <div className="text-sm font-medium capitalize text-white">{uw?.provider || "None"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Model</div>
                <ModelSelector
                  templateId={template.id}
                  currentProvider={uw.provider}
                  currentModel={uw.model}
                  customPrompt={uw.customPrompt}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
