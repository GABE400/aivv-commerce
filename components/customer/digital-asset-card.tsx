"use client";

import Image from "next/image";
import { Download, ExternalLink, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface DigitalAssetCardProps {
  asset: {
    id: string;
    purchaseDate: Date;
    variant: {
      name: string;
      assetUrl: string | null;
      product: {
        name: string;
        images: string[];
        description: string | null;
      };
    };
  };
}

export function DigitalAssetCard({ asset }: DigitalAssetCardProps) {
  const { product, name: variantName, assetUrl } = asset.variant;
  const mainImage = product.images[0] || "/placeholder.png";

  return (
    <div className="group relative rounded-2xl border border-glass-border glass overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1">
      {/* Asset Preview */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider">
            Digital Asset
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold truncate group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
            {variantName}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>{format(new Date(asset.purchaseDate), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            <span>HQ Asset</span>
          </div>
        </div>

        <div className="pt-2">
          {assetUrl ? (
            <a href={assetUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full accent-gradient text-white font-bold gap-2 h-11 shadow-lg shadow-accent/20">
                <Download className="size-4" />
                Download Now
              </Button>
            </a>
          ) : (
            <Button disabled className="w-full bg-muted text-muted-foreground font-bold gap-2 h-11 cursor-not-allowed">
              Processing Delivery...
            </Button>
          )}
        </div>
      </div>

      {/* Hover Overlay Link Style */}
      <div className="absolute inset-0 border-2 border-accent/0 group-hover:border-accent/20 rounded-2xl transition-all pointer-events-none" />
    </div>
  );
}
