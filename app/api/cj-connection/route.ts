import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cjConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encryptApiKey } from "@/lib/encryption";
import { cj } from "@/lib/cjdropshipping";

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

    // Validate the API key by attempting to get an access token
    try {
      const testClient = new (cj.constructor as any)();
      (testClient as any).apiKey = apiKey;
      await (testClient as any).getAccessToken();
    } catch (error) {
      console.error("CJ API key validation failed:", error);
      return NextResponse.json({ error: "Invalid CJ API key" }, { status: 400 });
    }

    // Encrypt the API key
    const encryptedApiKey = encryptApiKey(apiKey);

    // Check if connection already exists
    const existingConnection = await db.query.cjConnections.findFirst({
      where: eq(cjConnections.userId, session.user.id),
    });

    if (existingConnection) {
      // Update existing connection
      await db.update(cjConnections)
        .set({
          encryptedApiKey: encryptedApiKey,
          iv: "", // IV is embedded in encryptedApiKey
          storeName: storeName || null,
          isConnected: true,
          lastValidatedAt: new Date(),
          accessToken: null, // Clear cached token to force refresh
          tokenExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(cjConnections.id, existingConnection.id));
    } else {
      // Create new connection
      await db.insert(cjConnections).values({
        userId: session.user.id,
        encryptedApiKey: encryptedApiKey,
        iv: "", // IV is embedded in encryptedApiKey
        storeName: storeName || null,
        isConnected: true,
        lastValidatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, message: "CJ Dropshipping connected successfully" });
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
