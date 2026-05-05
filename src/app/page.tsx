import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { workspaceHomeForRole } from "@/lib/workspaces";

export default async function Index() {
  const user = await getCurrentUser();
  if (user) redirect(workspaceHomeForRole(user.role));
  redirect("/demo");
}
