

const PRINTIFY_BASE_URL = "https://api.printify.com/v1";

interface CreateOrderParams {
  externalId: string;
  lineItems: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    region: string;
    zip: string;
    country: string;
  };
}

class PrintifyClient {
  private apiKey: string;
  private shopId: string;

  constructor() {
    this.apiKey = process.env.PRINTIFY_API_KEY!;
    this.shopId = process.env.PRINTIFY_SHOP_ID!;
  }

  private async fetchPrintify(path: string, options: RequestInit = {}) {
    if (!this.apiKey || !this.shopId) {
      throw new Error("Printify credentials missing in environment variables.");
    }

    const response = await fetch(`${PRINTIFY_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Printify API error: ${error.message || JSON.stringify(error)}`);
    }

    return response.json();
  }

  async createOrder(params: CreateOrderParams) {
    const payload = {
      external_id: params.externalId,
      label: "Aivv Order",
      line_items: params.lineItems.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
      shipping_method: 1, // Default shipping
      send_shipping_notification: false,
      address_to: {
        first_name: params.shippingAddress.firstName,
        last_name: params.shippingAddress.lastName,
        email: params.shippingAddress.email,
        phone: params.shippingAddress.phone,
        address1: params.shippingAddress.address1,
        address2: params.shippingAddress.address2 || "",
        city: params.shippingAddress.city,
        region: params.shippingAddress.region,
        zip: params.shippingAddress.zip,
        country: params.shippingAddress.country,
      },
    };

    return this.fetchPrintify(`/shops/${this.shopId}/orders.json`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getOrder(orderId: string) {
    return this.fetchPrintify(`/shops/${this.shopId}/orders/${orderId}.json`);
  }

  async getProducts() {
    return this.fetchPrintify(`/shops/${this.shopId}/products.json`);
  }
}

export const printify = new PrintifyClient();
