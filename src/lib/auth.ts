import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Role } from "@/lib/enums";
import { workspaceHomeForRole } from "@/lib/workspaces";
import type { User } from "@prisma/client";

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "tsc_session";

export async function getCurrentUser(): Promise<User | null> {
  const userId = cookies().get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireRole(...roles: Role[]): Promise<User> {
  const u = await requireUser();
  if (!roles.includes(u.role as Role)) {
    redirect(`${workspaceHomeForRole(u.role)}?denied=1`);
  }
  return u;
}

export function isReadOnlyRole(role: Role): boolean {
  return role === "AUDITOR";
}
