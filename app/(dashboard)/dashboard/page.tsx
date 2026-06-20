import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardEntryPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const role = session.user.role;

  if (role === "admin") {
    return redirect("/dashboard/admin");
  }

  if (role === "supplier") {
    return redirect("/dashboard/supplier");
  }

  if (role === "customer" && !session.user.tosAccepted) {
    return redirect("/onboarding/terms");
  }

  return redirect("/dashboard/user");
}
