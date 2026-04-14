import { Container } from "@/components/ui/container";

const logos = [
  "Global Supply Connect",
  "PCI Compliant Logic",
  "Enterprise Scale Ready",
  "Automated Fulfillment",
];

export function SocialProof() {
  return (
    <section className="py-12 border-y border-glass-border bg-muted/30">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {logos.map((logo) => (
            <div 
              key={logo} 
              className="text-sm md:text-base font-semibold tracking-widest uppercase text-muted-foreground whitespace-nowrap"
            >
              {logo}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
