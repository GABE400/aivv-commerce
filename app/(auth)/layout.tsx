"use client";

import { Container } from "@/components/ui/container";
import Link from "next/link";
import Image from "next/image";
import { useIsTauri } from "@/lib/tauri";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isTauri = useIsTauri();
  const logoHref = isTauri ? "/login?platform=desktop" : "/";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Auth Header */}
      <header className="h-20 flex items-center px-8">
        <Link href={logoHref} className="flex items-center space-x-2">
           <Image
             src="/logoaivv.svg"
             alt="Aivv Logo"
             width={32}
             height={32}
             style={{ height: "auto" }}
             className="rounded-lg"
             priority
           />
           <span className="text-lg font-bold">Aivv <span className="text-accent">OS</span></span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Container className="max-w-md">
           <div className="glass border border-glass-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative">
                 {children}
              </div>
           </div>
           
           <p className="text-center mt-8 text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-accent underline underline-offset-4 font-medium hover:text-accent/80">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-accent underline underline-offset-4 font-medium hover:text-accent/80">Privacy Policy</Link>.
           </p>
        </Container>
      </main>
      
      <footer className="h-20 flex items-center justify-center px-8 text-xs text-muted-foreground">
        © 2026 Automated Intelligent Virtual Ventures. All rights reserved.
      </footer>
    </div>
  );
}

