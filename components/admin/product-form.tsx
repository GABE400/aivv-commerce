"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  X,
  Loader2,
  Link as LinkIcon,
  Percent,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploader } from "./file-uploader";
import {
  createProductAction,
  updateProductAction,
  applyMarkupToProductAction,
} from "@/lib/actions/products";
import { toast } from "sonner";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  costPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .or(z.literal("")),
  markupPercentage: z.number().int().min(0).max(5000).default(0),
  inventory: z.number().int().min(0).optional(),
  supplierVariantId: z.string().optional(),
  assetUrl: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["dropship", "pod", "digital", "subscription"]),
  categoryId: z.string().uuid("Please select a category"),
  supplierId: z.string().optional(),
  markupPercentage: z.number().int().min(0).max(5000),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  categories: any[];
  suppliers: any[];
  initialData?: any;
  productId?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Compute sell price from cost + markup. Returns empty string if inputs invalid. */
function computePrice(
  costPrice: string,
  markupPct: number,
  productMarkupPct: number
): string {
  const cost = parseFloat(costPrice);
  if (isNaN(cost) || cost <= 0) return "";
  const markup = markupPct > 0 ? markupPct : productMarkupPct;
  return (cost * (1 + markup / 100)).toFixed(2);
}

export function ProductForm({
  categories,
  suppliers,
  initialData,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!productId;
  const isSyncedProduct = !!initialData?.supplierProductId;
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingMarkup, setIsApplyingMarkup] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const buildDefaultVariants = (src: any[]) =>
    src.map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      costPrice: v.costPrice || "",
      markupPercentage: Number(v.markupPercentage ?? 0),
      inventory: v.inventory || 0,
      supplierVariantId: v.supplierVariantId || "",
      assetUrl: v.assetUrl || "",
    }));

  const defaultVariants = initialData?.variants?.length
    ? buildDefaultVariants(initialData.variants)
    : [
        {
          name: "Default",
          sku: "",
          price: "0.00",
          costPrice: "",
          markupPercentage: 0,
          inventory: 0,
          supplierVariantId: "",
          assetUrl: "",
        },
      ];

  const [variants, setVariants] = useState(defaultVariants);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.images || []
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      type: initialData?.type || "dropship",
      categoryId: initialData?.categoryId || "",
      supplierId: initialData?.supplierId || "",
      markupPercentage: Number(initialData?.markupPercentage ?? 0),
      variants: defaultVariants,
    },
  });

  const productType = form.watch("type");
  const watchedProductMarkup = form.watch("markupPercentage");

  // Auto-generate slug from product name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!slugManuallyEdited) {
      form.setValue("slug", generateSlug(name));
    }
  };

  /** When a variant's markup changes, auto-compute its sell price from cost */
  const handleVariantMarkupChange = useCallback(
    (index: number, markupPct: number) => {
      const costPrice = variants[index]?.costPrice;
      const newPrice = computePrice(costPrice, markupPct, watchedProductMarkup);
      if (newPrice) {
        const updated = variants.map((v: any, i: number) =>
          i === index
            ? { ...v, markupPercentage: markupPct, price: newPrice }
            : v
        );
        setVariants(updated);
        form.setValue(`variants.${index}.markupPercentage`, markupPct);
        form.setValue(`variants.${index}.price`, newPrice);
      } else {
        const updated = variants.map((v: any, i: number) =>
          i === index ? { ...v, markupPercentage: markupPct } : v
        );
        setVariants(updated);
        form.setValue(`variants.${index}.markupPercentage`, markupPct);
      }
    },
    [variants, watchedProductMarkup, form]
  );

  /** When product-level markup changes, re-compute prices for variants that use 0 (inherit) */
  const handleProductMarkupChange = useCallback(
    (productMarkup: number) => {
      form.setValue("markupPercentage", productMarkup);
      const updated = variants.map((v: any) => {
        if (v.markupPercentage === 0 && v.costPrice) {
          const newPrice = computePrice(v.costPrice, 0, productMarkup);
          return newPrice ? { ...v, price: newPrice } : v;
        }
        return v;
      });
      setVariants(updated);
      form.setValue("variants", updated);
    },
    [variants, form]
  );

  const addVariant = () => {
    const newVariants = [
      ...variants,
      {
        name: "",
        sku: "",
        price: "0.00",
        costPrice: "",
        markupPercentage: 0,
        inventory: 0,
        supplierVariantId: "",
        assetUrl: "",
      },
    ];
    setVariants(newVariants);
    form.setValue("variants", newVariants);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_: any, i: number) => i !== index);
      setVariants(newVariants);
      form.setValue("variants", newVariants);
    }
  };

  const handleApplyMarkup = async () => {
    if (!productId) return;
    setIsApplyingMarkup(true);
    try {
      const result = await applyMarkupToProductAction(productId);
      if (result.success) {
        toast.success(result.message || "Markup applied.");
        router.refresh();
      } else {
        toast.error((result as any).error || "Failed to apply markup");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsApplyingMarkup(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        images: uploadedImages,
        supplierId: data.supplierId === "none" ? undefined : data.supplierId,
      };

      const result = isEditMode
        ? await updateProductAction(productId!, payload)
        : await createProductAction(payload);

      if (result.success) {
        toast.success(isEditMode ? "Product updated!" : "Product created!");
        router.push("/dashboard/admin/products");
        router.refresh();
      } else {
        toast.error((result as any).error || "Operation failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column: details + variants ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="glass border-glass-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  onChange={handleNameChange}
                  placeholder="e.g. Signature Zip Hoodie"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="flex items-center gap-2">
                  <LinkIcon className="size-3" />
                  URL Slug
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    /products/
                  </span>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      form.setValue("slug", e.target.value);
                    }}
                    placeholder="e.g. signature-zip-hoodie"
                  />
                </div>
                {form.formState.errors.slug && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...form.register("description")}
                  className="w-full min-h-[120px] rounded-xl glass border border-glass-border bg-transparent p-4 text-sm focus:border-accent outline-none"
                  placeholder="Tell clients about this product..."
                />
              </div>

              <div className="space-y-4">
                <Label>Product Gallery</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl glass border border-glass-border overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt="Gallery"
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedImages((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute top-2 right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  <FileUploader
                    onUploadSuccess={(url) =>
                      setUploadedImages((prev) => [...prev, url])
                    }
                    onUploadError={() => {}}
                    label="Add Image"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card className="glass border-glass-border">
            <header className="p-6 border-b border-glass-border flex items-center justify-between">
              <div>
                <h3 className="font-bold">Product Variants</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set per-variant markup to override the product-level markup (0
                  = inherit).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                className="gap-2"
              >
                <Plus className="size-4" />
                Add Variant
              </Button>
            </header>

            <CardContent className="p-6 space-y-6">
              {variants.map((variant: any, index: number) => {
                const cost = parseFloat(variant.costPrice);
                const price = parseFloat(variant.price);
                const hasProfit = !isNaN(cost) && !isNaN(price) && cost > 0;
                const profit = hasProfit ? price - cost : 0;
                const profitPct =
                  hasProfit && price > 0 ? (profit / price) * 100 : 0;
                const effectiveMarkup =
                  variant.markupPercentage > 0
                    ? variant.markupPercentage
                    : watchedProductMarkup;

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-muted/30 border border-glass-border space-y-4"
                  >
                    <input
                      type="hidden"
                      {...form.register(`variants.${index}.id` as const)}
                      value={variant.id || ""}
                    />

                    {/* Row 1: Name, SKU, Cost, Sell Price */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          {...form.register(`variants.${index}.name` as const)}
                          placeholder="S, M, Red, etc"
                          onChange={(e) => {
                            form.setValue(
                              `variants.${index}.name`,
                              e.target.value
                            );
                            setVariants((prev: any[]) =>
                              prev.map((v, i) =>
                                i === index ? { ...v, name: e.target.value } : v
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          SKU
                        </Label>
                        <Input
                          {...form.register(`variants.${index}.sku` as const)}
                          placeholder="UNQ-ID-001"
                          onChange={(e) => {
                            form.setValue(
                              `variants.${index}.sku`,
                              e.target.value
                            );
                            setVariants((prev: any[]) =>
                              prev.map((v, i) =>
                                i === index ? { ...v, sku: e.target.value } : v
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Cost Price
                        </Label>
                        <Input
                          {...form.register(
                            `variants.${index}.costPrice` as const
                          )}
                          placeholder="19.99"
                          disabled={isSyncedProduct}
                          onChange={(e) => {
                            const val = e.target.value;
                            form.setValue(`variants.${index}.costPrice`, val);
                            const updated = variants.map(
                              (v: any, i: number) => {
                                if (i !== index) return v;
                                const newPrice = computePrice(
                                  val,
                                  v.markupPercentage,
                                  watchedProductMarkup
                                );
                                return {
                                  ...v,
                                  costPrice: val,
                                  ...(newPrice ? { price: newPrice } : {}),
                                };
                              }
                            );
                            setVariants(updated);
                            const newPrice = computePrice(
                              val,
                              variant.markupPercentage,
                              watchedProductMarkup
                            );
                            if (newPrice)
                              form.setValue(
                                `variants.${index}.price`,
                                newPrice
                              );
                          }}
                        />
                        {isSyncedProduct && (
                          <p className="text-[10px] text-muted-foreground">
                            Set by supplier
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Sell Price
                        </Label>
                        <Input
                          {...form.register(`variants.${index}.price` as const)}
                          placeholder="29.99"
                          onChange={(e) => {
                            form.setValue(
                              `variants.${index}.price`,
                              e.target.value
                            );
                            setVariants((prev: any[]) =>
                              prev.map((v, i) =>
                                i === index
                                  ? { ...v, price: e.target.value }
                                  : v
                              )
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Markup %, Inventory, Profit display, Delete */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Percent className="size-3" />
                          Variant Markup %
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="5000"
                            value={variant.markupPercentage}
                            onChange={(e) =>
                              handleVariantMarkupChange(
                                index,
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder={`${watchedProductMarkup} (inherited)`}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                        {variant.markupPercentage === 0 &&
                          watchedProductMarkup > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              Using product markup ({watchedProductMarkup}%)
                            </p>
                          )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Inventory
                        </Label>
                        <Input
                          type="number"
                          {...form.register(
                            `variants.${index}.inventory` as const,
                            { valueAsNumber: true }
                          )}
                        />
                      </div>

                      {hasProfit && (
                        <div className="space-y-1 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="size-3 text-emerald-500" />
                            Profit
                          </Label>
                          <p className="text-sm font-bold text-emerald-500">
                            ${profit.toFixed(2)}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({profitPct.toFixed(1)}% · {effectiveMarkup}%
                              markup)
                            </span>
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Digital asset uploader */}
                    {productType === "digital" && (
                      <div className="pt-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">
                          Source Digital Asset
                        </Label>
                        <FileUploader
                          isImage={false}
                          accept=".pdf,.zip,.rar,.mp4,.mp3,.png,.jpg"
                          label="Upload Digital Master"
                          preview={form.watch(`variants.${index}.assetUrl`)}
                          onUploadSuccess={(url) =>
                            form.setValue(`variants.${index}.assetUrl`, url)
                          }
                          onUploadError={() => {}}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: settings + markup ── */}
        <div className="space-y-8">
          <Card className="glass border-glass-border">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select
                  onValueChange={(v) => form.setValue("type", v as any)}
                  defaultValue={initialData?.type || "dropship"}
                >
                  <SelectTrigger className="glass border-glass-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="glass border-glass-border">
                    <SelectItem value="dropship">Dropshipping</SelectItem>
                    <SelectItem value="pod">Print on Demand</SelectItem>
                    <SelectItem value="digital">Digital Product</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  onValueChange={(v) => form.setValue("categoryId", v)}
                  defaultValue={initialData?.categoryId || ""}
                >
                  <SelectTrigger className="glass border-glass-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass border-glass-border">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Assigned Supplier</Label>
                <Select
                  onValueChange={(v) => form.setValue("supplierId", v)}
                  defaultValue={initialData?.supplierId || "none"}
                >
                  <SelectTrigger className="glass border-glass-border">
                    <SelectValue placeholder="Internal / Self" />
                  </SelectTrigger>
                  <SelectContent className="glass border-glass-border">
                    <SelectItem value="none">Internal / Self</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Markup Card */}
          <Card className="glass border-glass-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="size-4 text-accent" />
                <h3 className="font-bold text-sm">Markup Settings</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="markupPercentage">
                  Product-Level Markup (%)
                </Label>
                <div className="relative">
                  <Input
                    id="markupPercentage"
                    type="number"
                    min="0"
                    max="5000"
                    {...form.register("markupPercentage", {
                      valueAsNumber: true,
                    })}
                    onChange={(e) =>
                      handleProductMarkupChange(parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="glass border-glass-border pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied to all variants unless they have their own markup set.
                </p>
                {form.formState.errors.markupPercentage && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.markupPercentage.message}
                  </p>
                )}
              </div>

              {isEditMode && isSyncedProduct && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isApplyingMarkup}
                  onClick={handleApplyMarkup}
                  className="w-full gap-2 glass border-glass-border hover:bg-glass-highlight"
                >
                  {isApplyingMarkup ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Apply Markup to All Variants
                </Button>
              )}

              <div className="p-3 rounded-lg bg-muted/30 border border-glass-border text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">How markup works</p>
                <p>Sell price = Cost × (1 + markup / 100)</p>
                <p>
                  Per-variant markup overrides product-level when set above 0.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="glass border-glass-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Live Preview
              </h3>
              <div className="space-y-2">
                <p className="text-sm font-bold truncate">
                  {form.watch("name") || "Product Name"}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  /products/{form.watch("slug") || "your-slug"}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-[10px] uppercase font-bold">
                    {form.watch("type")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {variants.length} variant{variants.length !== 1 ? "s" : ""}
                  </span>
                  {watchedProductMarkup > 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                      {watchedProductMarkup}% markup
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl accent-gradient text-white font-bold shadow-xl shadow-accent/20"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin mr-2" />
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Publish Product"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
