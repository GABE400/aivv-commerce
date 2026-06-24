"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCart, CartItem } from "@/lib/store/use-cart";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToCartFormProps {
  product: {
    id: string;
    name: string;
    type: string;
    images: string[];
  };
  variants: any[];
}

export function AddToCartForm({ product, variants }: AddToCartFormProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant first");
      return;
    }

    setIsAdding(true);
    
    const cartItem: CartItem = {
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      price: parseFloat(selectedVariant.price),
      quantity: quantity,
      image: product.images[0],
      type: product.type,
    };

    // Simulate for premium feel
    setTimeout(() => {
      addItem(cartItem);
      toast.success(`${product.name} (${selectedVariant.name}) added to cart!`);
      setIsAdding(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {variants.length > 1 && (
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Select Option</Label>
            <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
              <SelectTrigger className="h-14 rounded-2xl glass border-glass-border">
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent className="glass border-glass-border">
                {variants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} — ${parseFloat(v.price).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Quantity</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-glass-border rounded-2xl bg-muted/30 h-14 px-2">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="size-10 flex items-center justify-center rounded-xl hover:bg-glass-highlight transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="size-10 flex items-center justify-center rounded-xl hover:bg-glass-highlight transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-xs text-muted-foreground font-medium uppercase">Unit Price</span>
              <span className="text-xl font-bold">
                ${selectedVariant ? (parseFloat(selectedVariant.price) * quantity).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <Button 
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant}
          className="w-full h-16 rounded-2xl accent-gradient text-white font-bold text-lg shadow-xl shadow-accent/20 gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdding ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="size-6" />
              Add to Cart
            </>
          )}
        </Button>
        {product.type === "pod" && (
          <button className="w-full h-14 rounded-2xl glass border border-glass-border text-foreground font-bold hover:bg-glass-highlight transition-all">
            Custom Design Configurator
          </button>
        )}
      </div>
    </div>
  );
}
