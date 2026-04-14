import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Only allow authenticated users to upload (Admin or Supplier)
  if (!session || (session.user.role !== "admin" && session.user.role !== "supplier")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate auth tokens" }, { status: 500 });
  }
}
