"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { getLinksForRole } from "@/lib/navigation";

export function MobileSidebar({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const role = user.role;
  const links = getLinksForRole(role);

  const handleLogout = async () => {
    await authClient.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 text-foreground/80 hover:text-accent hover:bg-glass-highlight rounded-xl transition-all lg:hidden border border-glass-border">
          <Menu className="size-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 glass border-r border-glass-border p-0 flex flex-col h-full z-50">
        <SheetHeader className="h-20 flex items-center justify-start px-8 border-b border-glass-border flex-row text-left">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
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
        </SheetHeader>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
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
           <div className="p-4 rounded-xl bg-muted/30 flex items-center space-x-3 mb-2">
               <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                  {user.name ? user.name[0] : "U"}
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
      </SheetContent>
    </Sheet>
  );
}
