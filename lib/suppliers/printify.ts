import { SupplierAdapter, FulfillmentOrder } from "./types";

/**
 * Skeleton for Printify Integration.
 * Real implementation would use Printify API: https://api.printify.com/v1/
 */
export class PrintifyAdapter implements SupplierAdapter {
  private apiKey: string;
  private shopId: string;

  constructor() {
    this.apiKey = process.env.PRINTIFY_API_KEY!;
    this.shopId = process.env.PRINTIFY_SHOP_ID!;
  }

  async createOrder(order: FulfillmentOrder) {
    console.log("Creating Printify order for items:", order.items.map(i => i.sku));
    
    // In production:
    // const response = await fetch(`https://api.printify.com/v1/shops/${this.shopId}/orders.json`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({...})
    // });
    // return { supplierOrderId: (await response.json()).id };

    return { supplierOrderId: `printify_mock_${Date.now()}` };
  }

  async getTracking(supplierOrderId: string) {
    // Poll Printify API for shipping info
    return { 
      status: "pending",
      trackingNumber: undefined
    };
  }
}

export const printifySupplier = new PrintifyAdapter();
