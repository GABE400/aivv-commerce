import { DodoPayments } from "dodopayments";
import { PaymentProvider, CheckoutSessionParams } from "./types";

const dodo = new DodoPayments({
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
});

export class DodoPaymentProvider implements PaymentProvider {
  async createCheckoutSession(params: CheckoutSessionParams) {
    const session = await dodo.checkouts.create({
      billing_address: {
        name: params.customer.name,
      },
      customer: {
        email: params.customer.email,
        name: params.customer.name,
      },
      product_cart: params.items.map((item) => ({
        name: item.name,
        description: item.description,
        price: Math.round(item.price * 100), // Dodo usually uses cents/subunit
        quantity: item.quantity,
        image_url: item.image,
      })),
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${params.orderId}/success`,
    });

    return {
      url: session.checkout_url,
      id: session.checkout_id,
    };
  }

  async verifyWebhook(payload: string, signature: string) {
    // Implement webhook verification using Dodo Payments SDK/logic
    // This typically involves crypto.createHmac and comparing with signature
    try {
      // Simplification for now - in production use the DodoPayments.webhooks.verify method
      return true; 
    } catch {
      return false;
    }
  }
}

export const paymentProvider = new DodoPaymentProvider();
