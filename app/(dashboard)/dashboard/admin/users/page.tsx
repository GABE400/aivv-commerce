import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    return redirect("/login");
  }

  // Fetch all users sorted by registration date
  const allUsers = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Store Administration</h2>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
      </div>

      <UsersClient initialUsers={allUsers as any} currentUserId={session.user.id} />
    </div>
  );
}
