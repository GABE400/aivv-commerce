import { SupplierAdapter, FulfillmentOrder } from "./types";
import { getCJClientForUser, isCJConnected } from "./cj-helper";
import { db } from "@/lib/db";
import { productVariants } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export class CJAdapter implements SupplierAdapter {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async createOrder(order: FulfillmentOrder) {
    console.log(
      "Starting CJ Dropshipping order creation for order ID:",
      order.orderId,
    );

    const connected = await isCJConnected(this.userId);
    if (!connected) {
      throw new Error("CJ Dropshipping account is not connected");
    }

    const cjClient = await getCJClientForUser(this.userId);

    // Parse shipping address
    let shippingData: any;
    try {
      shippingData = JSON.parse(order.customer.address);
    } catch {
      // If not JSON, use defaults
      shippingData = {
        name: order.customer.name,
        address1: order.customer.address,
        address2: "",
        city: "",
        province: "",
        country: "United States",
        countryCode: "US",
        zip: "",
        phone: "0000000000",
      };
    }

    // Get product/variant details to get CJ variant IDs
    const itemSkus = order.items.map((i) => i.sku);
    const variants = await db.query.productVariants.findMany({
      where: inArray(productVariants.sku, itemSkus),
    });

    const cjProducts = order.items.map((item) => {
      const variant = variants.find((v) => v.sku === item.sku);
      if (!variant?.supplierVariantId) {
        throw new Error(`CJ variant ID not found for SKU: ${item.sku}`);
      }
      return {
        vid: variant.supplierVariantId,
        quantity: item.quantity,
        storeLineItemId: item.sku,
      };
    });

    console.log("Calling CJ saveGenerateParentOrder with payload:", {
      orderNumber: order.orderId,
      products: cjProducts,
    });

    const response = await cjClient.saveGenerateParentOrder({
      orderNumber: order.orderId,
      shippingCustomerName: shippingData.name || order.customer.name,
      shippingAddress: shippingData.address1 || order.customer.address,
      shippingAddress2: shippingData.address2 || "",
      shippingCity: shippingData.city || "",
      shippingProvince: shippingData.province || shippingData.state || "",
      shippingCountry: shippingData.country || "United States",
      shippingCountryCode: shippingData.countryCode || "US",
      shippingZip: shippingData.zip || shippingData.postalCode || "",
      shippingPhone: shippingData.phone || "0000000000",
      products: cjProducts,
    });

    console.log("CJ saveGenerateParentOrder response:", response);

    const cjOrderId =
      response.data?.orderId ||
      response.data?.orderNumber ||
      response.result?.orderId;
    if (!cjOrderId) {
      throw new Error(
        "Failed to get CJ order ID from response: " + JSON.stringify(response),
      );
    }

    return { supplierOrderId: cjOrderId };
  }

  async getTracking(supplierOrderId: string) {
    const connected = await isCJConnected(this.userId);
    if (!connected) {
      throw new Error("CJ Dropshipping account is not connected");
    }

    const cjClient = await getCJClientForUser(this.userId);
    const response = await cjClient.getOrder(supplierOrderId);

    console.log("CJ getOrder response:", response);

    return {
      status: response.data?.status || response.result?.status || "pending",
      trackingNumber:
        response.data?.trackingNumber || response.result?.trackingNumber,
    };
  }
}
