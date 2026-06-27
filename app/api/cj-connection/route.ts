import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cjConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encryptApiKey } from "@/lib/encryption";
import {
  CJDropshippingClient,
  resolveAuthorizedCJShop,
} from "@/lib/cjdropshipping";

async function resolveCJShop(client: CJDropshippingClient) {
  try {
    console.log("resolveCJShop: Fetching shops from CJ...");
    const shops = await client.getShops();
    console.log("resolveCJShop: Shops fetched, resolving authorized shop...");
    const resolvedShop = resolveAuthorizedCJShop(shops);
    console.log("resolveCJShop: Resolved shop:", resolvedShop);
    return resolvedShop;
  } catch (error) {
    console.warn("Could not fetch CJ shops:", error);
    return null;
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
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
  console.log("CJ Connection POST request received");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      !session ||
      (session.user.role !== "business" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, storeName } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }

    const testClient = new CJDropshippingClient(session.user.id, apiKey);

    console.log("Validating CJ API key...");
    const isValid = await testClient.validateApiKey();
    if (!isValid) {
      console.error("CJ API key validation failed");
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 400 },
      );
    }

    console.log("CJ API key valid, resolving shop...");
    const shop = await resolveCJShop(testClient);
    const encryptedApiKey = encryptApiKey(apiKey);
    const resolvedStoreName = storeName || shop?.name || null;

    console.log(
      "Resolved store name:",
      resolvedStoreName,
      "Shop ID:",
      shop?.id,
    );

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
      console.log("Updating existing CJ connection...");
      await db
        .update(cjConnections)
        .set(connectionData)
        .where(eq(cjConnections.id, existingConnection.id));
    } else {
      console.log("Creating new CJ connection...");
      await db.insert(cjConnections).values({
        userId: session.user.id,
        ...connectionData,
      });
    }

    const message = shop
      ? `Supplier account connected. Store "${shop.name}" registered (ID: ${shop.id}).`
      : "Supplier account connected, but no authorized shop was found via the Shop API. Re-create your API store in settings (Authorization > API), then reconnect.";

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
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(cjConnections)
      .where(eq(cjConnections.userId, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Supplier disconnected",
    });
  } catch (error: any) {
    console.error("Error disconnecting CJ Dropshipping:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
