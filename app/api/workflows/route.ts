import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWorkflowsList = await db
      .select()
      .from(workflows)
      .where(eq(workflows.userId, session.user.id))
      .orderBy(desc(workflows.createdAt));

    return NextResponse.json(userWorkflowsList);
  } catch (error: any) {
    console.error("GET Workflows Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}
