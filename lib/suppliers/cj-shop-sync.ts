import { CJDropshippingClient } from "@/lib/cjdropshipping";

interface PlatformProduct {
  id: string;
  name: string;
  description?: string | null;
  images: string[];
}

interface PlatformVariant {
  id: string;
  name: string;
  sku: string;
  price: string;
  supplierVariantId: string;
}

export async function linkProductToCJShop(
  cj: CJDropshippingClient,
  shopId: string | null,
  platformProduct: PlatformProduct,
  cjProductId: string,
  variants: PlatformVariant[],
) {
  if (variants.length === 0) return;

  const image = platformProduct.images[0] || "";
  const prices = variants.map((v) => parseFloat(v.price));
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);

  await cj.saveStoreProduct({
    id: platformProduct.id,
    title: platformProduct.name,
    image,
    description: platformProduct.description || undefined,
    priceMin,
    priceMax,
    priceCurrency: "USD",
  });

  await cj.saveStoreVariantBatch(
    variants.map((v) => ({
      id: v.id,
      productId: platformProduct.id,
      title: v.name,
      sku: v.sku,
      image,
      shopPrice: parseFloat(v.price),
      shopPriceCurrency: "USD",
    })),
  );

  await cj.createProductConnection({
    ...(shopId ? { shopId } : {}),
    defaultArea: 1,
    logistics: "USPS+",
    cjProductId,
    platformProductId: platformProduct.id,
    sourceCountryCode: "CN",
    sourceCountry: "China",
    targetCountryCode: "US",
    targetCountry: "United States",
    variantList: variants.map((v) => ({
      cjVariantId: v.supplierVariantId,
      platformVariantId: v.id,
    })),
  });
}

export async function linkProductToCJShopSafe(
  cj: CJDropshippingClient,
  shopId: string | null,
  platformProduct: PlatformProduct,
  cjProductId: string,
  variants: PlatformVariant[],
) {
  try {
    await linkProductToCJShop(cj, shopId, platformProduct, cjProductId, variants);
    return { linked: true as const };
  } catch (error: any) {
    const message = error?.message || String(error);
    if (/already|exist|duplicate|connected/i.test(message)) {
      return { linked: true as const, skipped: true };
    }
    console.error(`CJ shop link failed for product ${platformProduct.id}:`, message);
    return { linked: false as const, error: message };
  }
}
