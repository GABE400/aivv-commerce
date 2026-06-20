"use client";

import Image from "next/image";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthModal } from "@/components/auth/auth-modal";
import { authClient } from "@/lib/auth-client";
import { CartDrawer } from "@/components/storefront/cart-drawer";

const navLinks = [
  { name: "Automate", href: "#automation" },
  { name: "Shop", href: "#shop" },
  { name: "Pricing", href: "#pricing" },
  { name: "How It Works", href: "#how-it-works" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const { data: session } = authClient.useSession();
  
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(var(--background-rgb), 0)", "rgba(var(--background-rgb), 0.8)"]
  );
  
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(12px)"]
  );

  const borderOpacity = useTransform(
    scrollY,
    [0, 100],
    ["rgba(var(--foreground-rgb), 0)", "rgba(var(--foreground-rgb), 0.1)"]
  );

  return (
    <>
      <motion.header
        style={{
          backgroundColor,
          backdropFilter: backdropBlur,
          borderColor: borderOpacity,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300"
      >
        <Container>
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logoaivv.svg"
                alt="AIVV - Automated Intelligent Virtual Ventures"
                width={36}
                height={36}
                className="rounded-lg"
                priority
              />
              <span className="text-xl font-bold tracking-tight">
                Automated Intelligent <span className="text-accent text-purple-600 dark:text-purple-400">Virtual Ventures</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-6 w-px bg-glass-border mx-2" />
              <ThemeToggle />
              <CartDrawer />
              
              {session ? (
                <div className="flex items-center gap-2">
                  {(session.user as any).role === "admin" && (
                    <Link href="/dashboard/admin">
                      <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-accent font-bold hover:bg-accent/10">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                      <User className="size-4" />
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="font-bold"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Sign In
                </Button>
              )}
              
              <Link href={session ? "/dashboard/customer/automate" : "/signup"}>
                <Button size="sm" className="rounded-xl">Workflow</Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-4 md:hidden">
              <ThemeToggle />
              <button
                className="text-foreground"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Nav */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-white/10"
        >
          <div className="flex flex-col space-y-4 p-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {session ? (
              <div className="space-y-4">
                {(session.user as any).role === "admin" && (
                  <Link href="/dashboard/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full gap-2 border-accent text-accent">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full gap-2">
                    <User className="size-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  setIsAuthModalOpen(true);
                }}
              >
                Sign In
              </Button>
            )}
            <Link href={session ? "/dashboard/customer/automate" : "/signup"} onClick={() => setIsOpen(false)}>
              <Button className="w-full">Workflow</Button>
            </Link>
          </div>
        </motion.div>
      </motion.header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
      />
    </>
  );
}
