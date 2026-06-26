"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";

interface ProductPageClientProps {
  productData: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    images: string[];
    variants: {
      id: string;
      name: string;
      price: string;
      imageUrl: string | null;
    }[];
    category: {
      name: string;
    } | null;
  };
}

export function ProductPageClient({ productData }: ProductPageClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(productData.variants[0]?.id || "");

  const variantImages = productData.variants
    .filter(v => v.imageUrl)
    .map(v => ({
      variantId: v.id,
      imageUrl: v.imageUrl!
    }));

  // Calculate price range
  const prices = productData.variants.map(v => parseFloat(v.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const hasPriceRange = minPrice !== maxPrice;
  const displayPrice = hasPriceRange ? `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}` : `$${minPrice.toFixed(2)}`;

  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
      {/* Left: Sticky Image Gallery */}
      <ProductGallery
        images={productData.images}
        productName={productData.name}
        variantImages={variantImages}
        selectedVariantId={selectedVariantId}
      />

      {/* Right: Product Info & Actions */}
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
            {productData.category?.name || "Premium Collection"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {productData.name}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-foreground">
              {displayPrice}
            </span>
            <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase">
              In Stock
            </div>
          </div>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {productData.description}
        </p>

        <div className="pt-8 border-t border-glass-border">
          <AddToCartForm
            product={productData}
            variants={productData.variants}
            onVariantChange={setSelectedVariantId}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8">
           <div className="p-4 rounded-xl bg-muted/50 border border-glass-border space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Fulfillment</div>
              <div className="text-sm font-semibold text-foreground">Global Priority</div>
           </div>
           <div className="p-4 rounded-xl bg-muted/50 border border-glass-border space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Shipping</div>
              <div className="text-sm font-semibold text-foreground">2-5 Business Days</div>
           </div>
        </div>
      </div>
    </div>
  );
}
