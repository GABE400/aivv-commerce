"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getLinksForRole } from "@/lib/navigation";

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = user.role;

  const links = getLinksForRole(role);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-glass-border glass lg:block">
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="flex h-20 items-center px-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logoaivv.svg"
              alt="AIVV"
              width={32}
              height={32}
              style={{ height: "auto" }}
              className="rounded-lg"
            />
            <span className="text-lg font-bold">Aivv <span className="text-accent">OS</span></span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-muted-foreground hover:bg-glass-highlight hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-glass-border p-4 space-y-2">
           <div className="p-4 rounded-xl bg-muted/30 flex items-center space-x-3 mb-4">
               <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                  {user.name[0]}
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground lowercase truncate">{role}</p>
               </div>
           </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
