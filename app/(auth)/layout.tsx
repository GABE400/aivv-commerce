import { Container } from "@/components/ui/container";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Auth Header */}
      <header className="h-20 flex items-center px-8">
        <Link href="/" className="flex items-center space-x-2">
           <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">A</div>
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
