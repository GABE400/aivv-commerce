import { db } from "@/lib/db";
import { cjConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decryptApiKey } from "@/lib/encryption";
import { CJDropshippingClient, resolveAuthorizedCJShop } from "@/lib/cjdropshipping";

export async function getCJClientForUser(userId: string): Promise<CJDropshippingClient> {
  const connection = await db.query.cjConnections.findFirst({
    where: eq(cjConnections.userId, userId),
  });

  if (!connection || !connection.isConnected) {
    throw new Error("CJ Dropshipping is not connected. Please connect your account first.");
  }

  const apiKey = decryptApiKey(connection.encryptedApiKey);
  
  const client = new CJDropshippingClient(userId, apiKey);
  
  // Restore cached token if available and not expired
  if (connection.accessToken && connection.tokenExpiry && new Date() < connection.tokenExpiry) {
    (client as any).cachedToken = connection.accessToken;
    (client as any).tokenExpiry = connection.tokenExpiry;
  }
  
  return client;
}

export async function isCJConnected(userId: string): Promise<boolean> {
  const connection = await db.query.cjConnections.findFirst({
    where: eq(cjConnections.userId, userId),
  });
  return connection?.isConnected || false;
}

export async function getCJShopIdForUser(userId: string): Promise<string | null> {
  const connection = await db.query.cjConnections.findFirst({
    where: eq(cjConnections.userId, userId),
  });
  return connection?.shopId ?? null;
}

export async function ensureCJShopId(userId: string, client: CJDropshippingClient): Promise<string | null> {
  const connection = await db.query.cjConnections.findFirst({
    where: eq(cjConnections.userId, userId),
  });

  if (!connection) return null;
  if (connection.shopId) return connection.shopId;

  try {
    const shops = await client.getShops();
    const shop = resolveAuthorizedCJShop(shops);
    if (!shop) return null;

    await db.update(cjConnections)
      .set({
        shopId: shop.id,
        storeName: connection.storeName || shop.name,
        updatedAt: new Date(),
      })
      .where(eq(cjConnections.id, connection.id));

    return shop.id;
  } catch (error) {
    console.warn("Could not resolve CJ shop ID:", error);
    return null;
  }
}
