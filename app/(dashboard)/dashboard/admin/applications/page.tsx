import { db } from "@/lib/db";
import { supplierApplications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DataTable } from "@/components/ui/data-table";
import { ApplicationReviewButtons } from "@/components/admin/application-review-buttons";
import { format } from "date-fns";
import { Globe, Store, User } from "lucide-react";

export default async function AdminApplicationsPage() {
  const pendingApplications = await db.query.supplierApplications.findMany({
    where: eq(supplierApplications.status, "pending"),
    with: {
      user: true,
    },
    orderBy: (apps, { desc }) => [desc(apps.createdAt)],
  });

  const columns = [
    {
      header: "Applicant / Store",
      accessorKey: "storeName",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Store className="size-4 text-accent" />
          </div>
          <div>
            <div className="font-bold">{row.storeName}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <User className="size-2.5" />
              {row.user.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Business Website",
      accessorKey: "website",
      cell: (row: any) => (
        row.website ? (
          <a 
            href={row.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <Globe className="size-3" />
            Launch Site
          </a>
        ) : (
          <span className="text-xs text-muted-foreground italic">No Website Provided</span>
        )
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row: any) => (
        <div className="text-xs truncate max-w-[300px] text-muted-foreground" title={row.description}>
          {row.description}
        </div>
      ),
    },
    {
      header: "Submitted",
      accessorKey: "createdAt",
      cell: (row: any) => (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {format(new Date(row.createdAt), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: any) => (
        <ApplicationReviewButtons applicationId={row.id} />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Supply Chain Onboarding</h2>
        <h1 className="text-3xl font-bold">Supplier Applications</h1>
      </div>

      <DataTable 
        columns={columns} 
        data={pendingApplications} 
      />
    </div>
  );
}
