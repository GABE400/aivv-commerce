import { db } from "@/lib/db";
import { cjConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decryptApiKey } from "@/lib/encryption";
import { CJDropshippingClient } from "@/lib/cjdropshipping";

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
