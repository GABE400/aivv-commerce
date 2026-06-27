import { DodoPayments } from "dodopayments";
import { PaymentProvider, CheckoutSessionParams } from "./types";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
});

export class DodoPaymentProvider implements PaymentProvider {
  async createCheckoutSession(params: CheckoutSessionParams) {
    const defaultDodoProductId = process.env.DODO_PRODUCT_ID || "p_mock_123";
    const session = await dodo.checkoutSessions.create({
      customer: {
        email: params.customer.email,
        name: params.customer.name,
      },
      product_cart: params.items.map((item) => ({
        product_id: item.productId || defaultDodoProductId,
        quantity: item.quantity,
        amount: Math.round(item.price * 100),
      })),
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${params.orderId}/success`,
    });

    return {
      url: session.checkout_url || "",
      id: session.session_id || "",
    };
  }

  async verifyWebhook(payload: string, headers: Record<string, string>) {
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("DODO_PAYMENTS_WEBHOOK_SECRET is not set. Webhook signature verification skipped.");
      return true;
    }
    try {
      dodo.webhooks.unwrap(payload, {
        headers,
        key: webhookSecret,
      });
      return true;
    } catch (error) {
      console.error("Dodo webhook verification failed:", error);
      return false;
    }
  }
}

export const paymentProvider = new DodoPaymentProvider();
