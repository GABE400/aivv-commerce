"use client";

import { useState } from "react";
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
import { Plus, X, Loader2, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploader } from "./file-uploader";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/actions/products";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["dropship", "pod", "digital", "subscription"]),
  categoryId: z.string().uuid("Please select a category"),
  supplierId: z.string().optional(),
  markupPercentage: z.number().int().min(0).max(5000),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name is required"),
        sku: z.string().min(1, "SKU is required"),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
        costPrice: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .optional(),
        inventory: z.number().int().min(0).optional(),
        supplierVariantId: z.string().optional(),
        assetUrl: z.string().optional(),
      }),
    )
    .min(1, "At least one variant is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  categories: any[];
  suppliers: any[];
  initialData?: any; // Pre-filled product for editing
  productId?: string; // If present, we're in edit mode
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  categories,
  suppliers,
  initialData,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!productId;
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const defaultVariants = initialData?.variants?.map((v: any) => ({
    name: v.name,
    sku: v.sku,
    price: v.price,
    costPrice: v.costPrice || "",
    inventory: v.inventory || 0,
    supplierVariantId: v.supplierVariantId || "",
    assetUrl: v.assetUrl || "",
  })) || [{ name: "Default", sku: "", price: "0.00" }];

  const [variants, setVariants] = useState(defaultVariants);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.images || [],
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

  // Auto-generate slug from product name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!slugManuallyEdited) {
      const slug = generateSlug(name);
      form.setValue("slug", slug);
    }
  };

  const addVariant = () => {
    const newVariants = [...variants, { name: "", sku: "", price: "0.00" }];
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

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        images: uploadedImages,
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
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                  placeholder="Tell clients about this masterpiece..."
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
                            prev.filter((_, idx) => idx !== i),
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

          <Card className="glass border-glass-border">
            <header className="p-6 border-b border-glass-border flex items-center justify-between">
              <h3 className="font-bold">Product Variants</h3>
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
              {variants.map((_: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-glass-border relative"
                >
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Name
                    </Label>
                    <Input
                      {...form.register(`variants.${index}.name` as const)}
                      placeholder="S, M, Red, etc"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      SKU
                    </Label>
                    <Input
                      {...form.register(`variants.${index}.sku` as const)}
                      placeholder="UNQ-ID-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      CJ Price (Cost)
                    </Label>
                    <Input
                      {...form.register(`variants.${index}.costPrice` as const)}
                      placeholder="19.99"
                      disabled={!!variants[index].supplierVariantId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Your Price (Sell)
                    </Label>
                    <Input
                      {...form.register(`variants.${index}.price` as const)}
                      placeholder="29.99"
                    />
                  </div>
                  {variants[index].costPrice && variants[index].price && (
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Profit
                      </Label>
                      <p className="text-sm font-medium text-green-600">
                        $
                        {(
                          parseFloat(variants[index].price) -
                          parseFloat(variants[index].costPrice)
                        ).toFixed(2)}
                        <span className="text-xs text-muted-foreground ml-1">
                          (
                          {(
                            ((parseFloat(variants[index].price) -
                              parseFloat(variants[index].costPrice)) /
                              parseFloat(variants[index].price)) *
                            100
                          ).toFixed(1)}
                          %)
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Inventory
                      </Label>
                      <Input
                        type="number"
                        {...form.register(
                          `variants.${index}.inventory` as const,
                          { valueAsNumber: true },
                        )}
                      />
                    </div>
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

                  {productType === "digital" && (
                    <div className="md:col-span-4 pt-2">
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
              ))}
            </CardContent>
          </Card>
        </div>

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
                  defaultValue={initialData?.supplierId || ""}
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

              <div className="space-y-2">
                <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
                <Input
                  id="markupPercentage"
                  type="number"
                  min="0"
                  max="5000"
                  {...form.register("markupPercentage", {
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  className="glass border-glass-border"
                />
                <p className="text-xs text-muted-foreground">
                  Profit margin added to supplier price (0-5000%)
                </p>
                {form.formState.errors.markupPercentage && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.markupPercentage.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Card */}
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
