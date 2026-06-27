"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendContactEmailAction } from "@/lib/actions/contact";
import { Copy, Check, Mail, Send, MessageSquare, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("contact@techadotech.com");
      setCopied(true);
      toast.success("Email address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy email automatically.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await sendContactEmailAction(formData);
      if (result.success) {
        toast.success("Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(result.error || "Failed to send message.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again later or copy our email directly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Left Column: Direct Info & Quick Copy */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
                  Support & Inquiries
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground font-syne tracking-tight mb-4">
                  Get in Touch
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  Have questions about AIVV OS, automation workflows, custom catalog fulfillment, or billing? Drop us a message, and our team will get back to you within 24 hours.
                </p>
              </div>

              {/* Direct Mail Card (Quick Copy Option requested by user) */}
              <div className="p-6 rounded-3xl glass border border-glass-border space-y-4">
                <div className="flex items-center space-x-3 text-accent">
                  <Mail className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Direct Channels</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If you experience issues sending the contact form, or prefer using your desktop email client, feel free to copy our support address:
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-2xl border border-glass-border">
                  <span className="text-xs font-mono font-bold text-foreground flex-1 select-all pl-2 truncate">
                    contact@techadotech.com
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover active:scale-95 transition-all shadow-md shadow-accent/15 cursor-pointer"
                    aria-label="Copy email address"
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Support Guidelines */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                    <ShieldCheck className="size-3" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Global Payout Support</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Fulfillment & billing is handled securely under Dodo Payments framework.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-5 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-500">
                    <MessageSquare className="size-3" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">24/7 Operations Helpdesk</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">We coordinate directly with our global manufacturing and supply channels to resolve processing blocks.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Glass Form Container */}
            <div className="lg:col-span-7 p-8 rounded-3xl glass border border-glass-border shadow-2xl relative overflow-hidden">
              {/* Decorative backgrounds */}
              <div className="absolute -top-32 -right-32 size-64 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 size-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

              <form onSubmit={handleSubmit} className="space-y-6 relative">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 rounded-xl glass border-glass-border focus:border-accent bg-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 rounded-xl glass border-glass-border focus:border-accent bg-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Subject Topic
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="General Inquiry, Workflow Automation, Partnership..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-12 rounded-xl glass border-glass-border focus:border-accent bg-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Detailed Message
                  </Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your questions or requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl glass border border-glass-border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-transparent text-foreground placeholder:text-muted-foreground leading-relaxed"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl accent-gradient text-white font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send className="size-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
