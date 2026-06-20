import ImageKit from "@imagekit/nodejs";
import { SupplierAdapter, FulfillmentOrder } from "./types";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

export class ImageKitAdapter implements SupplierAdapter {
  async createOrder(order: FulfillmentOrder) {
    // For digital products, we don't "create an order" with ImageKit in the same way,
    // but we might generate signed URLs or send emails.
    // For now, we'll just return a placeholder ID.
    return { supplierOrderId: `digital_${order.orderId}` };
  }

  async getTracking() {
    return { status: "delivered" }; // Digital products are delivered instantly
  }

  async generateSecureDownloadUrl(path: string) {
    return imagekit.helper.buildSrc({
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
      src: path,
      signed: true,
      expiresIn: 3600, // 1 hour
    });
  }
}

export const digitalSupplier = new ImageKitAdapter();
