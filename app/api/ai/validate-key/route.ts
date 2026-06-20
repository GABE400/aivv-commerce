import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/providers";

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const aiProvider = getProvider(provider);
    const isValid = await aiProvider.validateKey(apiKey);

    return NextResponse.json({ valid: isValid });
  } catch (error: any) {
    console.error("Key Validation Error:", error);
    return NextResponse.json({ error: error.message || "Validation failed", valid: false }, { status: 500 });
  }
}
