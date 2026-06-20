import { Container } from "@/components/ui/container";
import { Palette, CreditCard, Cloud, Truck } from "lucide-react";

const badges = [
  {
    name: "Printify",
    color: "border-emerald-500/20 dark:border-emerald-400/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500 dark:bg-emerald-600",
    icon: Palette,
  },
  {
    name: "Dodo Payments",
    color: "border-orange-500/20 dark:border-orange-400/20 bg-orange-500/5 text-orange-600 dark:text-orange-400",
    dotColor: "bg-orange-500 dark:bg-orange-600",
    icon: CreditCard,
  },
  {
    name: "Netlify",
    color: "border-cyan-500/20 dark:border-cyan-400/20 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400",
    dotColor: "bg-cyan-500 dark:bg-cyan-600",
    icon: Cloud,
  },
  {
    name: "Your Supplier",
    color: "border-purple-500/20 dark:border-purple-400/20 bg-purple-500/5 text-purple-600 dark:text-purple-400",
    dotColor: "bg-purple-500 dark:bg-purple-600",
    icon: Truck,
  },
];

export function SocialProof() {
  return (
    <section className="py-6 border-y border-glass-border bg-[#F9FAFB]/90 dark:bg-[#1E293B]/70 backdrop-blur-md">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
      `}</style>
      
      <Container>
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-6">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase whitespace-nowrap">
            Powered by trusted infrastructure —
          </span>
          <div className="flex items-center gap-6">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.name}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-sm text-xs font-semibold shadow-sm hover:shadow-md hover:border-accent/30 hover:scale-105 transition-all duration-300 ${badge.color}`}
                >
                  <div className={`size-5 rounded-full flex items-center justify-center text-white shrink-0 ${badge.dotColor}`}>
                    <Icon className="size-3" />
                  </div>
                  <span className="font-bold tracking-wide">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center gap-4">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Powered by trusted infrastructure —
          </span>
          <div className="w-full overflow-hidden relative">
            {/* Fading gradients at edges */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F9FAFB]/90 dark:from-[#1E293B]/70 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F9FAFB]/90 dark:from-[#1E293B]/70 to-transparent z-10 pointer-events-none" />
            
            <div className="animate-marquee gap-4 pr-4">
              {/* First Set */}
              {badges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={`m1-${idx}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm text-[11px] font-semibold ${badge.color} shrink-0`}
                  >
                    <div className={`size-4.5 rounded-full flex items-center justify-center text-white shrink-0 ${badge.dotColor}`}>
                      <Icon className="size-2.5" />
                    </div>
                    <span className="font-bold">{badge.name}</span>
                  </div>
                );
              })}
              {/* Second Set (Duplicate for infinite seamless scroll) */}
              {badges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={`m2-${idx}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm text-[11px] font-semibold ${badge.color} shrink-0`}
                  >
                    <div className={`size-4.5 rounded-full flex items-center justify-center text-white shrink-0 ${badge.dotColor}`}>
                      <Icon className="size-2.5" />
                    </div>
                    <span className="font-bold">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
