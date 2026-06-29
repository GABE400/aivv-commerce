"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthModal } from "@/components/auth/auth-modal";
import { authClient } from "@/lib/auth-client";
import { CartDrawer } from "@/components/storefront/cart-drawer";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ShopNavbarProps {
  categories?: Category[];
}

export function ShopNavbar({ categories = [] }: ShopNavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const { data: session } = authClient.useSession();

  return (
    <>
      <div className="w-full bg-background border-b border-glass-border/30 transition-colors duration-300">
        {/* Subtle Top Banner */}
        <div className="w-full py-2 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 text-center text-xs font-medium tracking-wide text-white">
          <span>Are you a business? </span>
          <Link href="/" className="underline hover:text-blue-300 font-bold ml-1 transition-colors">
            Explore Aivv for Business →
          </Link>
        </div>

        <header className="relative z-50">
          <Container>
            <div className="flex h-16 md:h-20 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logoaivv.svg"
                  alt="AIVV"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  priority
                />
                <span className="text-lg font-bold font-syne tracking-tight">
                  AIVV <span className="text-blue-400 font-normal">Shop</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/shop#catalog" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>

                {/* Categories Dropdown Link */}
                <div className="relative group">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Categories
                    <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                  </button>

                  <div className="absolute top-full left-0 pt-2 w-48 hidden group-hover:block hover:block z-50 transition-all duration-300">
                    <div className="rounded-xl glass border border-glass-border/60 bg-background/95 backdrop-blur-md shadow-2xl py-2">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/shop?category=${category.slug}#catalog`}
                            className="block px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-blue-400 hover:bg-muted/50 transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))
                      ) : (
                        <span className="block px-4 py-2 text-xs text-muted-foreground">No categories</span>
                      )}
                    </div>
                  </div>
                </div>

                {session && (
                  <Link href="/dashboard/customer/orders" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                    Orders
                  </Link>
                )}
                
                <div className="h-5 w-px bg-glass-border/40 mx-1" />
                <ThemeToggle />
                <CartDrawer />
                
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-bold border-glass-border">
                      <User className="size-3.5" />
                      Account
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-bold text-xs"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    Sign In
                  </Button>
                )}
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center space-x-3 md:hidden">
                <CartDrawer />
                <ThemeToggle />
                <button
                  className="text-foreground p-1"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
              </div>
            </div>
          </Container>

          {/* Mobile Nav */}
          {isOpen && (
            <div className="md:hidden overflow-hidden bg-background/95 border-b border-glass-border/40 backdrop-blur-xl">
              <div className="flex flex-col space-y-4 p-6">
                <Link
                  href="/shop#catalog"
                  className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  All Products
                </Link>
                
                {/* Categories on Mobile */}
                {categories.length > 0 && (
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">
                      Categories
                    </span>
                    <div className="pl-3 flex flex-col space-y-2 border-l border-glass-border/30">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/shop?category=${category.slug}#catalog`}
                          className="text-xs font-bold text-muted-foreground hover:text-blue-400"
                          onClick={() => setIsOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {session && (
                  <Link
                    href="/dashboard/customer/orders"
                    className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Orders
                  </Link>
                )}
                
                <div className="w-full h-px bg-glass-border/30 my-2" />

                {session ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 rounded-xl text-sm font-bold">
                      <User className="size-4" />
                      My Account
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl text-sm font-bold border-glass-border"
                    onClick={() => {
                      setIsOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
        </header>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
      />
    </>
  );
}
