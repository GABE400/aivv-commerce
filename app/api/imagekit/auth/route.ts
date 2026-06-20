import ImageKit from "@imagekit/nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
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
    const authenticationParameters = imagekit.helper.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate auth tokens" }, { status: 500 });
  }
}
