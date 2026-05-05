import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { Role } from "@/lib/enums";
import { workspaceHomeForRole } from "@/lib/workspaces";

export async function requireWorkspaceRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(`${workspaceHomeForRole(user.role)}?denied=workspace`);
  }
  return user;
}
