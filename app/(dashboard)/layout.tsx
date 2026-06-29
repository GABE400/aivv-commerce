import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import Link from "next/link";
import Image from "next/image";

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
    <div className="flex min-h-screen bg-background text-foreground flex-col lg:flex-row">
      {/* Mobile Top Navigation */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-glass-border glass sticky top-0 z-40">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logoaivv.svg"
            alt="AIVV"
            width={28}
            height={28}
            style={{ height: "auto" }}
            className="rounded-lg"
          />
          <span className="text-md font-bold">Aivv <span className="text-accent">OS</span></span>
        </Link>
        
        <MobileSidebar user={session.user} />
      </header>

      {/* Shared Dashboard Sidebar */}
      <Sidebar user={session.user} />
      
      <main className="flex-1 lg:pl-64">
        <div className="p-4 md:p-8 lg:p-12">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                     {role === 'admin' ? 'Master Control' : role === 'business' ? 'Operations Portal' : 'My Account'}
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
