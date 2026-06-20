import { redirect } from "next/navigation";

export default function UserDashboardRedirect() {
  return redirect("/dashboard/customer");
}
