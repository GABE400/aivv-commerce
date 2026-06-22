import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";

const footerLinks = {
  Product: [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Dashboard", href: "#dashboard" },
  ],
  Resources: [
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Guides", href: "#" },
    { name: "Status", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Legal", href: "#" },
    { name: "Contact", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="py-20 bg-muted/30 border-t border-glass-border">
      <Container>
        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="md:col-span-1 lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logoaivv.svg"
                alt="AIVV - Automated Intelligent Virtual Ventures"
                width={36}
                height={36}
                style={{ height: "auto" }}
                className="rounded-lg"
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                <span className="inline md:hidden font-syne">AIVV</span>
                <span className="hidden md:inline">
                  Automated Intelligent <span className="text-accent">Virtual Ventures</span>
                </span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Automate your business, shop without inventory. Powered by custom AI workflows and global print-on-demand fulfillment.
            </p>
            <div className="flex space-x-4">
              <div className="size-10 rounded-full bg-muted/50 border border-glass-border flex items-center justify-center hover:bg-accent/10 hover:border-accent/40 transition-all cursor-pointer text-foreground">
                <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
              <div className="size-10 rounded-full bg-muted/50 border border-glass-border flex items-center justify-center hover:bg-accent/10 hover:border-accent/40 transition-all cursor-pointer text-foreground">
                <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.229-1.552 3.234-1.233 3.234-1.233.645 1.653.24 2.873.12 3.176.77.84 1.235 1.911 1.235 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-6">
              <h4 className="text-sm font-bold tracking-widest uppercase text-foreground">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Automated Intelligent Virtual Ventures. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
