import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const role = session.user.role;
  
  // Logic to prevent cross-dashboard access
  // If someone with role 'customer' tries to access '/admin', redirect them.
  // This layout handles basic protection, subpages can have tighter gates.

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Shared Dashboard Sidebar */}
      <Sidebar user={session.user} />
      
      <main className="flex-1 lg:pl-64">
        <div className="p-4 md:p-8 lg:p-12">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                     {role === 'admin' ? 'Master Control' : role === 'supplier' ? 'Business Portal' : 'My Account'}
                  </h2>
                  <h1 className="text-3xl font-bold">
                     Dashboard
                  </h1>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold">
                     {session.user.name[0]}
                  </div>
               </div>
            </div>
            
            {children}
        </div>
      </main>
    </div>
  );
}
