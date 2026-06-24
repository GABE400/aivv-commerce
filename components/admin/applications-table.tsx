"use client";

import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { Globe, Store, User } from "lucide-react";
import { ApplicationReviewButtons } from "./application-review-buttons";

interface ApplicationsTableProps {
  applications: any[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
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
    <DataTable 
      columns={columns} 
      data={applications} 
    />
  );
}
