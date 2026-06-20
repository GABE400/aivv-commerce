import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700"],
});

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { ImageKitProvider } from "@/components/imagekit-provider";

export const metadata: Metadata = {
  title: "Aivv Commerce OS | The Operating System for E-commerce",
  description: "Build a global e-commerce system without holding inventory. Automate fulfillment, accept global payments, and manage everything from a single powerful dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased selection:bg-purple-500/30 selection:text-white`}
    >
      <body 
        className="min-h-full bg-background text-foreground flex flex-col font-sans transition-colors duration-300"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ImageKitProvider>
            {children}
            <Toaster richColors position="top-center" />
          </ImageKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
