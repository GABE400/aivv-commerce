export type FulfillmentOrder = {
  orderId: string;
  customer: {
    name: string;
    email: string;
    address: string; // JSON or formatted string
  };
  items: {
    sku: string;
    quantity: number;
    metadata?: any;
    supplierVariantId?: string;
  }[];
};

export interface SupplierAdapter {
  createOrder(order: FulfillmentOrder): Promise<{ supplierOrderId: string }>;
  getTracking(supplierOrderId: string): Promise<{ trackingNumber?: string; status: string }>;
}
