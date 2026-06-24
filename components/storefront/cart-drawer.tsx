"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, MoveRight, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/lib/store/use-cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { createCheckoutAction } from "@/lib/actions/checkout";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    startTransition(async () => {
      const result = await createCheckoutAction(
        items.map(i => ({ variantId: i.variantId, quantity: i.quantity }))
      );

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Checkout failed");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 text-foreground/80 hover:text-accent transition-colors">
          <ShoppingCart className="size-6" />
          {mounted && getItemCount() > 0 && (
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-accent/20">
              {getItemCount()}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md glass border-l border-glass-border flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-glass-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-accent" />
            Your Shopping Bag
          </SheetTitle>
        </SheetHeader>

        {mounted && items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 py-6">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="size-20 rounded-xl glass border border-glass-border overflow-hidden relative flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="size-full bg-muted flex items-center justify-center">
                          <ShoppingBag className="size-8 opacity-10" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between gap-2">
                        <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.variantName}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-glass-border rounded-lg bg-muted/30">
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-glass-highlight transition-colors"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-glass-highlight transition-colors"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 bg-muted/30 border-t border-glass-border flex-col mt-auto gap-4 sm:flex-col">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px]">Calculated at checkout</span>
                </div>
                <Separator className="bg-glass-border my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-accent">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={isPending}
                className="w-full h-14 rounded-2xl accent-gradient text-white font-bold text-lg shadow-xl shadow-accent/20 gap-2"
              >
                {isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Checkout Now
                    <MoveRight className="size-5" />
                  </>
                )}
              </Button>
              
              <p className="text-[10px] text-center text-muted-foreground">
                Taxes and priority fulfillment options updated next.
              </p>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center border border-glass-border">
              <ShoppingBag className="size-10 opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Your bag is empty</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Looks like you haven't added anything to your global commerce collection yet.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl mt-4"
              onClick={() => setIsOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
