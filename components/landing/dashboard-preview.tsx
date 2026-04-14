"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const orders = [
  { id: "#8291", customer: "Alex Rivera", product: "Aura Runner Pro", status: "Fulfilled", amount: "$189.00", date: "2 mins ago" },
  { id: "#8290", customer: "Sarah Chen", product: "Stealth Hoodie", status: "In Production", amount: "$89.00", date: "15 mins ago" },
  { id: "#8289", customer: "Marcus Vogt", product: "Nova Earbuds", status: "Pending", amount: "$129.00", date: "1 hour ago" },
  { id: "#8288", customer: "Elena Smith", product: "Pulse Smartwatch", status: "Fulfilled", amount: "$349.00", date: "3 hours ago" },
];

export function DashboardPreview() {
  return (
    <section id="dashboard" className="py-24 relative overflow-hidden bg-background transition-colors duration-500">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 dark:bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
      
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">A dashboard for <span className="text-gradient">operators.</span></h2>
          <p className="text-lg text-muted-foreground">
            Manage your entire global supply chain from a single, beautiful interface. 
            Real-time data visualization and automated status tracking.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-2xl blur opacity-10 dark:opacity-20 pointer-events-none" />
          
          <Card className="overflow-hidden border-glass-border shadow-2xl">
            <div className="grid lg:grid-cols-[240px_1fr] h-[600px]">
              {/* Sidebar */}
              <div className="hidden lg:flex flex-col border-r border-glass-border bg-muted/50 p-6">
                <div className="flex items-center space-x-2 mb-10">
                  <div className="size-6 rounded bg-accent flex items-center justify-center text-[10px] font-bold text-white">A</div>
                  <span className="font-bold text-sm text-foreground">Aivv OS</span>
                </div>
                
                <div className="space-y-2">
                  {["Dashboard", "Orders", "Products", "Suppliers", "Analytics", "Settings"].map((item, i) => (
                    <div 
                      key={item} 
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                        i === 0 ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-col overflow-hidden bg-background">
                <header className="h-16 border-b border-glass-border flex items-center justify-between px-8">
                  <h3 className="text-sm font-semibold text-foreground">Overview</h3>
                  <div className="flex items-center space-x-4">
                    <div className="size-8 rounded-full bg-muted" />
                  </div>
                </header>

                <div className="p-8 overflow-y-auto space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Revenue", value: "$42,810", trend: "+12%" },
                      { label: "Orders", value: "1,240", trend: "+5%" },
                      { label: "Active Suppliers", value: "14", trend: "0%" },
                      { label: "Avg. Fulfilment", value: "1.2d", trend: "-8%" },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 rounded-xl bg-muted/50 border border-glass-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{stat.label}</div>
                        <div className="text-lg font-bold text-foreground">{stat.value}</div>
                        <div className="text-[10px] text-emerald-500 font-medium">{stat.trend}</div>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="rounded-xl border border-glass-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted text-muted-foreground">
                        <tr>
                          <th className="px-6 py-4 font-medium uppercase text-[10px]">Order ID</th>
                          <th className="px-6 py-4 font-medium uppercase text-[10px]">Product</th>
                          <th className="px-6 py-4 font-medium uppercase text-[10px]">Customer</th>
                          <th className="px-6 py-4 font-medium uppercase text-[10px]">Status</th>
                          <th className="px-6 py-4 font-medium uppercase text-[10px]">Amount</th>
                          <th className="px-6 py-4 font-medium uppercase text-[10px]">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-glass-border text-foreground">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium">{order.id}</td>
                            <td className="px-6 py-4 text-accent font-medium">{order.product}</td>
                            <td className="px-6 py-4">{order.customer}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-bold",
                                order.status === "Fulfilled" ? "bg-emerald-500/10 text-emerald-500" : 
                                order.status === "In Production" ? "bg-amber-500/10 text-amber-500" : 
                                "bg-muted text-muted-foreground"
                              )}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{order.amount}</td>
                            <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
