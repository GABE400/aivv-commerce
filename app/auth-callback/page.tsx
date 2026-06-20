import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  // Check if first-time user (created within the last 15 seconds)
  const isFirstTime = (new Date().getTime() - new Date(session.user.createdAt).getTime()) < 15000;

  if (isFirstTime) {
    return redirect("/onboarding/terms");
  }

  return redirect("/dashboard/user");
}
