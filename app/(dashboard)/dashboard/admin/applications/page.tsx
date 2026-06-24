import { db } from "@/lib/db";
import { supplierApplications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ApplicationsTable } from "@/components/admin/applications-table";

export default async function AdminApplicationsPage() {
  const pendingApplications = await db.query.supplierApplications.findMany({
    where: eq(supplierApplications.status, "pending"),
    with: {
      user: true,
    },
    orderBy: (apps, { desc }) => [desc(apps.createdAt)],
  });



  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Onboarding</h2>
        <h1 className="text-3xl font-bold">Business Applications</h1>
      </div>

      <ApplicationsTable applications={pendingApplications} />
    </div>
  );
}
