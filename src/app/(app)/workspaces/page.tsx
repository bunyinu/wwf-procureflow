import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { workspaceHomeForRole } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

export default async function WorkspacesIndexPage() {
  const user = await requireUser();
  redirect(workspaceHomeForRole(user.role));
}
