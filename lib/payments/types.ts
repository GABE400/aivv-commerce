export type CheckoutSessionParams = {
  customer: {
    name: string;
    email: string;
  };
  items: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image?: string;
    productId?: string;
  }[];
  orderId: string;
  metadata?: Record<string, string>;
};

export interface PaymentProvider {
  createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string; id: string }>;
  verifyWebhook(payload: string, headers: Record<string, string>): Promise<boolean>;
}
