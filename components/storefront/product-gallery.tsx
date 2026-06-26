"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  variantImages?: { variantId: string; imageUrl: string }[];
  selectedVariantId?: string;
}

export function ProductGallery({ images, productName, variantImages, selectedVariantId }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get variant-specific image if available
  const variantImage = selectedVariantId && variantImages
    ? variantImages.find(v => v.variantId === selectedVariantId)?.imageUrl
    : null;

  // Use variant image if available, otherwise use selected gallery image
  const displayImage = variantImage || (images[selectedIndex] || "");

  if (!images || images.length === 0) {
    return (
      <div className="sticky top-32 space-y-4">
        <div className="aspect-square glass rounded-3xl overflow-hidden border border-glass-border relative flex items-center justify-center">
          <span className="text-muted-foreground">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-32 space-y-4">
      <div className="aspect-square glass rounded-3xl overflow-hidden border border-glass-border relative">
        <Image
          src={displayImage}
          alt={`${productName} ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority={selectedIndex === 0}
        />
      </div>
      {!variantImage && images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square glass rounded-xl overflow-hidden border relative cursor-pointer transition-all ${
                selectedIndex === i
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-glass-border hover:border-accent/60"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
