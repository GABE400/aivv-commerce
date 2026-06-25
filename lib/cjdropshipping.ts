const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

export interface CJCalculateShippingParams {
  startCountryCode?: string;
  endCountryCode: string;
  products: { vid: string; quantity: number }[];
}

export interface CJCreateOrderParams {
  orderNumber: string;
  shippingCustomerName: string;
  shippingAddress: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingProvince: string;
  shippingCountry: string;
  shippingCountryCode: string;
  shippingZip: string;
  shippingPhone: string;
  products: { vid: string; quantity: number; storeLineItemId?: string }[];
}

export interface CJShop {
  id: string;
  name: string;
  status: number;
  type: string;
}

export interface CJSaveStoreProductParams {
  id: string;
  title: string;
  image: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  priceCurrency?: string;
}

export interface CJSaveStoreVariant {
  id: string;
  productId: string;
  title: string;
  sku: string;
  image: string;
  shopPrice?: number;
  shopPriceCurrency?: string;
}

export interface CJCreateProductConnectionParams {
  shopId?: string;
  defaultArea: number;
  logistics: string;
  cjProductId: string;
  platformProductId: string;
  sourceCountryCode?: string;
  sourceCountry?: string;
  targetCountryCode?: string;
  targetCountry?: string;
  variantList: { cjVariantId: string; platformVariantId: string }[];
}

export function resolveAuthorizedCJShop(shops: CJShop[]): CJShop | null {
  const authorized = shops.filter((shop) => shop.status === 1);
  if (authorized.length === 0) return null;
  return (
    authorized.find((shop) => shop.type?.toLowerCase() === "api") ??
    authorized[0]
  );
}

class CJDropshippingClient {
  private apiKey: string;
  private cachedToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private userId: string | null = null;

  constructor(
    userId: string | null = null,
    apiKey: string | undefined = undefined,
  ) {
    if (apiKey) {
      this.apiKey = apiKey;
    } else {
      this.apiKey = process.env.CJ_API_KEY || "";
    }
    this.userId = userId;
  }

  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(
        `${CJ_BASE_URL}/authentication/getAccessToken`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey: this.apiKey,
          }),
        },
      );

      if (!response.ok) {
        return false;
      }

      const res = (await response.json()) as any;
      return res.code === 200 && res.data?.accessToken;
    } catch (error) {
      console.error("Error validating CJ API key:", error);
      return false;
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "CJ Dropshipping API Key is missing. Please connect your CJ Dropshipping account.",
      );
    }

    if (this.cachedToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.cachedToken;
    }

    try {
      const response = await fetch(
        `${CJ_BASE_URL}/authentication/getAccessToken`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey: this.apiKey,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `CJ Auth request failed with status: ${response.status}`,
        );
      }

      const res = (await response.json()) as any;
      if (res.code !== 200 || !res.data?.accessToken) {
        throw new Error(
          `CJ Auth returned failed body: ${res.message || JSON.stringify(res)}`,
        );
      }

      this.cachedToken = res.data.accessToken;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1-day safety margin

      // Update cached token in database if userId is provided
      if (this.userId) {
        try {
          const { db } = await import("@/lib/db");
          const { cjConnections } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");
          await db
            .update(cjConnections)
            .set({
              accessToken: this.cachedToken,
              tokenExpiry: this.tokenExpiry,
              updatedAt: new Date(),
            })
            .where(eq(cjConnections.userId, this.userId));
        } catch (dbError) {
          console.error("Failed to cache token in database:", dbError);
        }
      }

      return this.cachedToken!;
    } catch (error) {
      console.error("Error obtaining CJ Access Token:", error);
      throw error;
    }
  }

  private async fetchCJ(path: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();

    const response = await fetch(`${CJ_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": token,
        ...options.headers,
      } as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CJ API error: ${response.status} - ${errorText}`);
    }

    const res = (await response.json()) as any;
    if (res.code !== 200) {
      throw new Error(
        `CJ API returned error code ${res.code}: ${res.message || JSON.stringify(res)}`,
      );
    }

    return res;
  }

  async getProducts(
    params: { page?: number; size?: number; keyWord?: string } = {},
  ) {
    const page = params.page || 1;
    const size = params.size || 20;
    let url = `/product/myProduct/query?pageNumber=${page}&pageSize=${size}`;
    if (params.keyWord) {
      url += `&keyWord=${encodeURIComponent(params.keyWord)}`;
    }
    return this.fetchCJ(url);
  }

  async getProductDetails(productId: string) {
    return this.fetchCJ(`/product/query?productId=${productId}`);
  }

  async getVariants(productId: string) {
    return this.fetchCJ(`/product/variant/query?pid=${productId}`);
  }

  async calculateShippingRates(
    params: CJCalculateShippingParams,
  ): Promise<number> {
    try {
      const payload = {
        startCountryCode: params.startCountryCode || "CN",
        endCountryCode: params.endCountryCode,
        products: params.products,
      };

      const response = await this.fetchCJ("/logistic/freightCalculate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = response.data || response.result || [];
      if (Array.isArray(data) && data.length > 0) {
        const validOptions = data.filter(
          (opt: any) =>
            typeof opt.logisticPrice === "number" ||
            typeof opt.logisticPrice === "string",
        );
        if (validOptions.length > 0) {
          const prices = validOptions.map((opt: any) =>
            parseFloat(opt.logisticPrice),
          );
          return Math.min(...prices);
        }
      }
      return 0;
    } catch (error) {
      console.error("CJ Shipping Rate Calculation Error:", error);
      return 0;
    }
  }

  async createOrder(params: CJCreateOrderParams) {
    const payload = {
      orderNumber: params.orderNumber,
      shippingCustomerName: params.shippingCustomerName,
      shippingAddress: params.shippingAddress,
      shippingAddress2: params.shippingAddress2 || "",
      shippingCity: params.shippingCity,
      shippingProvince: params.shippingProvince,
      shippingCountry: params.shippingCountry,
      shippingCountryCode: params.shippingCountryCode,
      shippingZip: params.shippingZip,
      shippingPhone: params.shippingPhone || "0000000000",
      logisticName: "USPS+", // Default logistic carrier
      payType: 3, // Create only (unpaid in CJ)
      products: params.products,
    };

    return this.fetchCJ("/shopping/order/createOrderV2", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getOrder(cjOrderNumber: string) {
    return this.fetchCJ(
      `/shopping/order/getOrderDetail?orderNumber=${cjOrderNumber}`,
    );
  }

  async getShops(): Promise<CJShop[]> {
    const res = await this.fetchCJ("/shop/getShops");
    return Array.isArray(res.data) ? res.data : [];
  }

  async addToMyProduct(productId: string) {
    return this.fetchCJ("/product/addToMyProduct", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  }

  async saveStoreProduct(params: CJSaveStoreProductParams) {
    return this.fetchCJ("/store/product/saveProduct", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async saveStoreVariantBatch(variants: CJSaveStoreVariant[]) {
    return this.fetchCJ("/store/product/saveVariantBatch", {
      method: "POST",
      body: JSON.stringify({ variants }),
    });
  }

  async createProductConnection(params: CJCreateProductConnectionParams) {
    return this.fetchCJ("/product/conn/connection", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async saveGenerateParentOrder(params: CJCreateOrderParams) {
    const payload = {
      orderNumber: params.orderNumber,
      shippingCustomerName: params.shippingCustomerName,
      shippingAddress: params.shippingAddress,
      shippingAddress2: params.shippingAddress2 || "",
      shippingCity: params.shippingCity,
      shippingProvince: params.shippingProvince,
      shippingCountry: params.shippingCountry,
      shippingCountryCode: params.shippingCountryCode,
      shippingZip: params.shippingZip,
      shippingPhone: params.shippingPhone || "0000000000",
      logisticName: "USPS+",
      payType: 3,
      products: params.products,
    };

    return this.fetchCJ("/shopping/order/saveGenerateParentOrder", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export { CJDropshippingClient };

export const cj = new CJDropshippingClient();
