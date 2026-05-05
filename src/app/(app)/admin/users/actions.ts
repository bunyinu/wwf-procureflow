"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { assertCan } from "@/lib/permissions";
import { Role } from "@/lib/enums";

const userSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  role: z.enum([
    Role.REQUESTER,
    Role.MANAGER,
    Role.PROCUREMENT,
    Role.FINANCE,
    Role.AUDITOR,
    Role.ADMIN,
  ]),
  departmentId: z.string().min(1),
});

export async function createUserAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "create", "user", {}, "/admin/users?denied=1");
  const result = userSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId"),
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/users?error=${msg}`);
  }
  const parsed = result.data;
  const created = await prisma.user.create({
    data: {
      ...parsed,
      password: "demo123",
      active: true,
    },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "USER_CREATED",
    entityType: "User",
    entityId: created.id,
    newValue: `${created.email} / ${created.role}`,
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUserAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "update", "user", {}, "/admin/users?denied=1");
  const id = String(formData.get("id"));
  const result = userSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId"),
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/users/${id}?error=${msg}`);
  }
  const parsed = result.data;
  const before = await prisma.user.findUnique({ where: { id } });
  if (!before) redirect("/admin/users");
  await prisma.user.update({
    where: { id },
    data: parsed,
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: id,
    oldValue: `${before!.email} / ${before!.role}`,
    newValue: `${parsed.email} / ${parsed.role}`,
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  redirect("/admin/users");
}

export async function resetPasswordAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "update", "user", {}, "/admin/users?denied=1");
  const id = String(formData.get("id"));
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) redirect("/admin/users");
  await prisma.user.update({
    where: { id },
    data: { password: "demo123" },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "USER_PASSWORD_RESET",
    entityType: "User",
    entityId: id,
    newValue: "Mot de passe réinitialisé à la valeur par défaut (demo123)",
  });
  revalidatePath(`/admin/users/${id}`);
  redirect(`/admin/users/${id}?reset=1`);
}

export async function toggleUserAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "update", "user", {}, "/admin/users?denied=1");
  const id = String(formData.get("id"));
  const current = await prisma.user.findUnique({ where: { id } });
  if (!current) redirect("/admin/users");
  await prisma.user.update({
    where: { id },
    data: { active: !current!.active },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: current!.active ? "USER_DEACTIVATED" : "USER_ACTIVATED",
    entityType: "User",
    entityId: id,
    oldValue: current!.active ? "active" : "inactive",
    newValue: current!.active ? "inactive" : "active",
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

// ---------- Departments CRUD ----------

const departmentSchema = z.object({
  name: z.string().min(2),
  code: z
    .string()
    .min(2)
    .max(8)
    .regex(/^[A-Z0-9_-]+$/, "Code en MAJUSCULES uniquement"),
  managerUserId: z.string().optional().nullable(),
});

export async function createDepartmentAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "create", "department", {}, "/admin/departments?denied=1");
  const result = departmentSchema.safeParse({
    name: formData.get("name"),
    code: String(formData.get("code") || "").toUpperCase(),
    managerUserId: (formData.get("managerUserId") as string) || null,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/departments?error=${msg}`);
  }
  const parsed = result.data;
  const created = await prisma.department.create({
    data: {
      name: parsed.name,
      code: parsed.code,
      managerUserId: parsed.managerUserId || null,
    },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "DEPARTMENT_CREATED",
    entityType: "Department",
    entityId: created.id,
    newValue: `${created.code} — ${created.name}`,
  });
  revalidatePath("/admin/departments");
  redirect("/admin/departments");
}

export async function updateDepartmentAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "update", "department", {}, "/admin/departments?denied=1");
  const id = String(formData.get("id"));
  const result = departmentSchema.safeParse({
    name: formData.get("name"),
    code: String(formData.get("code") || "").toUpperCase(),
    managerUserId: (formData.get("managerUserId") as string) || null,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/departments?error=${msg}`);
  }
  const parsed = result.data;
  const before = await prisma.department.findUnique({ where: { id } });
  if (!before) redirect("/admin/departments");
  await prisma.department.update({
    where: { id },
    data: {
      name: parsed.name,
      code: parsed.code,
      managerUserId: parsed.managerUserId || null,
    },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "DEPARTMENT_UPDATED",
    entityType: "Department",
    entityId: id,
    oldValue: `${before!.code} — ${before!.name}`,
    newValue: `${parsed.code} — ${parsed.name}`,
  });
  revalidatePath("/admin/departments");
  redirect("/admin/departments");
}
