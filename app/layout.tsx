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

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aivv.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Automated Intelligent Virtual Ventures | AI-Powered Business Automation & E-Commerce Platform",
    template: "%s | Automated Intelligent Virtual Ventures",
  },
  description:
    "AIVV (Automated Intelligent Virtual Ventures) is an AI-powered business automation and e-commerce platform that helps entrepreneurs and companies automate workflows, manage operations, and build scalable online businesses through intelligent automation, print-on-demand, and dropshipping solutions.",
  keywords: [
    "AIVV",
    "Automated Intelligent Virtual Ventures",
    "AI automation",
    "e-commerce platform",
    "dropshipping",
    "print on demand",
    "business automation",
    "workflow automation",
    "online store builder",
    "AI-powered e-commerce",
    "inventory-free commerce",
    "global fulfillment",
    "custom manufacturing",
    "on-demand delivery",
    "automated business",
    "virtual ventures",
    "scalable online business",
  ],
  applicationName: "Automated Intelligent Virtual Ventures",
  creator: "AIVV",
  publisher: "AIVV - Automated Intelligent Virtual Ventures",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logoaivv.svg",
    apple: "/logoaivv.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Automated Intelligent Virtual Ventures",
    title: "Automated Intelligent Virtual Ventures | AI-Powered Business Automation & E-Commerce",
    description:
      "Automate your business with AI, sell globally without inventory. AIVV combines intelligent workflow automation with print-on-demand and dropshipping for scalable online ventures.",
    images: [
      {
        url: "/logoaivv.svg",
        width: 1536,
        height: 1024,
        alt: "Automated Intelligent Virtual Ventures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Automated Intelligent Virtual Ventures | AI-Powered Business Automation & E-Commerce",
    description:
      "Automate your business with AI, sell globally without inventory. Intelligent automation, print-on-demand, and dropshipping in one platform.",
    images: ["/logoaivv.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
