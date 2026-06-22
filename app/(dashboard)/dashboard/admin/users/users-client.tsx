"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Trash2, Loader2, Users, ShieldAlert, Award, User } from "lucide-react";
import { updateUserRoleAction, deleteUserAction } from "@/lib/actions/users";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  tosAccepted: boolean;
  createdAt: Date;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  currentUserId: string;
}

export function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRoleChange = (userId: string, newRole: "admin" | "business" | "customer") => {
    setUpdatingId(userId);
    startTransition(async () => {
      try {
        const res = await updateUserRoleAction(userId, newRole);
        if (res.success) {
          toast.success("User role updated successfully.");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update user role.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const handleDelete = (userId: string, userName: string) => {
    if (!window.confirm(`WARNING: Are you sure you want to delete user "${userName}"? This will delete all their workflows, API keys, orders, sessions, and accounts. This action is permanent.`)) {
      return;
    }

    setDeletingId(userId);
    startTransition(async () => {
      try {
        const res = await deleteUserAction(userId);
        if (res.success) {
          toast.success(`Successfully deleted user "${userName}".`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete user.");
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/15 gap-1 py-0.5">
            <ShieldAlert className="size-3" />
            Admin
          </Badge>
        );
      case "business":
        return (
          <Badge className="bg-cyan-500/10 border-cyan-500/20 text-cyan-500 hover:bg-cyan-500/15 gap-1 py-0.5">
            <Award className="size-3" />
            Business
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/15 gap-1 py-0.5">
            <User className="size-3" />
            Shopper
          </Badge>
        );
    }
  };

  // Filter users based on search query
  const filteredUsers = initialUsers.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      header: "User Details",
      accessorKey: "name",
      cell: (row: UserItem) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground border border-glass-border">
            {row.name ? row.name[0].toUpperCase() : "?"}
          </div>
          <div>
            <div className="font-bold text-foreground flex items-center gap-2">
              {row.name}
              {row.id === currentUserId && (
                <span className="text-[9px] bg-accent/25 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  You
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Active Role",
      accessorKey: "role",
      cell: (row: UserItem) => getRoleBadge(row.role),
    },
    {
      header: "Terms Check",
      accessorKey: "tosAccepted",
      cell: (row: UserItem) => (
        <span className={row.tosAccepted ? "text-emerald-500 text-xs font-bold" : "text-muted-foreground/60 text-xs italic"}>
          {row.tosAccepted ? "Accepted" : "Pending"}
        </span>
      ),
    },
    {
      header: "Registered",
      accessorKey: "createdAt",
      cell: (row: UserItem) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Manage Role",
      accessorKey: "role",
      cell: (row: UserItem) => {
        const isSelf = row.id === currentUserId;
        return (
          <div className="w-[140px]">
            {isSelf ? (
              <span className="text-xs text-muted-foreground/50 italic">Cannot edit self</span>
            ) : (
              <Select
                defaultValue={row.role}
                disabled={isPending && (updatingId === row.id || deletingId === row.id)}
                onValueChange={(val) => handleRoleChange(row.id, val as any)}
              >
                <SelectTrigger className="h-8 glass border-glass-border text-xs focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  <SelectItem value="customer">Shopper</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: UserItem) => {
        const isSelf = row.id === currentUserId;
        return (
          <div className="flex items-center gap-2">
            {updatingId === row.id && (
              <Loader2 className="size-4 animate-spin text-accent" />
            )}
            {!isSelf && (
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={isPending && (deletingId === row.id || updatingId === row.id)}
                onClick={() => handleDelete(row.id, row.name)}
                className="size-8 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 disabled:opacity-40"
              >
                {isPending && deletingId === row.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top filter section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 rounded-xl border border-glass-border bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 glass"
          />
        </div>

        <span className="text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-full border border-glass-border">
          Total Registered: {initialUsers.length}
        </span>
      </div>

      {/* Users table */}
      <DataTable columns={columns} data={filteredUsers} />
    </div>
  );
}
