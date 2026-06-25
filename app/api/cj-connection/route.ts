import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cjConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encryptApiKey } from "@/lib/encryption";
import { CJDropshippingClient, resolveAuthorizedCJShop } from "@/lib/cjdropshipping";

async function resolveCJShop(client: CJDropshippingClient) {
  try {
    const shops = await client.getShops();
    return resolveAuthorizedCJShop(shops);
  } catch (error) {
    console.warn("Could not fetch CJ shops:", error);
    return null;
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await db.query.cjConnections.findFirst({
      where: eq(cjConnections.userId, session.user.id),
    });

    if (!connection) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: connection.isConnected,
      storeName: connection.storeName,
      shopId: connection.shopId,
      shopRegistered: Boolean(connection.shopId),
      lastValidatedAt: connection.lastValidatedAt,
    });
  } catch (error: any) {
    console.error("Error fetching CJ connection status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || (session.user.role !== "business" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, storeName } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const testClient = new CJDropshippingClient(session.user.id, apiKey);

    const isValid = await testClient.validateApiKey();
    if (!isValid) {
      console.error("CJ API key validation failed");
      return NextResponse.json({ error: "Invalid CJ API key" }, { status: 400 });
    }

    const shop = await resolveCJShop(testClient);
    const encryptedApiKey = encryptApiKey(apiKey);
    const resolvedStoreName = storeName || shop?.name || null;

    const existingConnection = await db.query.cjConnections.findFirst({
      where: eq(cjConnections.userId, session.user.id),
    });

    const connectionData = {
      encryptedApiKey,
      iv: "",
      storeName: resolvedStoreName,
      shopId: shop?.id ?? null,
      isConnected: true,
      lastValidatedAt: new Date(),
      accessToken: null,
      tokenExpiry: null,
      updatedAt: new Date(),
    };

    if (existingConnection) {
      await db.update(cjConnections)
        .set(connectionData)
        .where(eq(cjConnections.id, existingConnection.id));
    } else {
      await db.insert(cjConnections).values({
        userId: session.user.id,
        ...connectionData,
      });
    }

    const message = shop
      ? `CJ Dropshipping connected. Store "${shop.name}" registered (ID: ${shop.id}).`
      : "CJ Dropshipping connected, but no authorized shop was found via the Shop API. Re-create your API store in CJ (Authorization > API), then reconnect.";

    return NextResponse.json({
      success: true,
      message,
      shopRegistered: Boolean(shop),
      shopId: shop?.id ?? null,
      shopName: shop?.name ?? null,
    });
  } catch (error: any) {
    console.error("Error connecting CJ Dropshipping:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.delete(cjConnections)
      .where(eq(cjConnections.userId, session.user.id));

    return NextResponse.json({ success: true, message: "CJ Dropshipping disconnected" });
  } catch (error: any) {
    console.error("Error disconnecting CJ Dropshipping:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
