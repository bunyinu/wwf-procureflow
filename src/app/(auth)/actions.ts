"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || user.password !== password) {
    redirect("/login?error=1");
  }

  cookies().set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/dashboard");
}

export async function quickLoginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/login?error=1");
  cookies().set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
  redirect("/demo");
}
