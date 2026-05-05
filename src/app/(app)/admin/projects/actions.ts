"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { assertCan } from "@/lib/permissions";
import { Role } from "@/lib/enums";

const projectSchema = z.object({
  name: z.string().min(2),
  projectCode: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Code en MAJUSCULES uniquement"),
  donor: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  active: z.string().optional(),
});

export async function createProjectAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "create", "project", {}, "/admin/projects?denied=1");
  const result = projectSchema.safeParse({
    name: formData.get("name"),
    projectCode: String(formData.get("projectCode") || "").toUpperCase(),
    donor: (formData.get("donor") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    active: (formData.get("active") as string) || undefined,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/projects?error=${msg}`);
  }
  const p = result.data;
  const created = await prisma.project.create({
    data: {
      name: p.name,
      projectCode: p.projectCode,
      donor: p.donor || null,
      startDate: p.startDate ? new Date(p.startDate) : null,
      endDate: p.endDate ? new Date(p.endDate) : null,
      active: p.active === "on",
    },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "PROJECT_CREATED",
    entityType: "Project",
    entityId: created.id,
    newValue: `${created.projectCode} — ${created.name}`,
  });
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function updateProjectAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "update", "project", {}, "/admin/projects?denied=1");
  const id = String(formData.get("id"));
  const result = projectSchema.safeParse({
    name: formData.get("name"),
    projectCode: String(formData.get("projectCode") || "").toUpperCase(),
    donor: (formData.get("donor") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    active: (formData.get("active") as string) || undefined,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/projects?error=${msg}`);
  }
  const p = result.data;
  const before = await prisma.project.findUnique({ where: { id } });
  if (!before) redirect("/admin/projects");
  await prisma.project.update({
    where: { id },
    data: {
      name: p.name,
      projectCode: p.projectCode,
      donor: p.donor || null,
      startDate: p.startDate ? new Date(p.startDate) : null,
      endDate: p.endDate ? new Date(p.endDate) : null,
      active: p.active === "on",
    },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "PROJECT_UPDATED",
    entityType: "Project",
    entityId: id,
    oldValue: `${before!.projectCode} — ${before!.name}`,
    newValue: `${p.projectCode} — ${p.name}`,
  });
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

const budgetSchema = z.object({
  projectId: z.string().min(1),
  code: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Code en MAJUSCULES uniquement"),
  label: z.string().min(2),
  allocatedBudget: z.coerce.number().nonnegative(),
  currency: z.string().min(3).max(4).default("USD"),
  active: z.string().optional(),
});

export async function createBudgetLineAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "create", "budgetLine", {}, "/admin/budget-lines?denied=1");
  const result = budgetSchema.safeParse({
    projectId: formData.get("projectId"),
    code: String(formData.get("code") || "").toUpperCase(),
    label: formData.get("label"),
    allocatedBudget: formData.get("allocatedBudget"),
    currency: formData.get("currency") || "USD",
    active: (formData.get("active") as string) || undefined,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/budget-lines?error=${msg}`);
  }
  const b = result.data;
  const created = await prisma.budgetLine.create({
    data: {
      projectId: b.projectId,
      code: b.code,
      label: b.label,
      allocatedBudget: b.allocatedBudget,
      currency: b.currency,
      active: b.active === "on",
    },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "BUDGET_LINE_CREATED",
    entityType: "BudgetLine",
    entityId: created.id,
    newValue: `${created.code} — ${created.label}`,
  });
  revalidatePath("/admin/budget-lines");
  redirect("/admin/budget-lines");
}

export async function updateBudgetLineAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "update", "budgetLine", {}, "/admin/budget-lines?denied=1");
  const id = String(formData.get("id"));
  const result = budgetSchema.safeParse({
    projectId: formData.get("projectId"),
    code: String(formData.get("code") || "").toUpperCase(),
    label: formData.get("label"),
    allocatedBudget: formData.get("allocatedBudget"),
    currency: formData.get("currency") || "USD",
    active: (formData.get("active") as string) || undefined,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/admin/budget-lines?error=${msg}`);
  }
  const b = result.data;
  const before = await prisma.budgetLine.findUnique({ where: { id } });
  if (!before) redirect("/admin/budget-lines");
  await prisma.budgetLine.update({
    where: { id },
    data: {
      projectId: b.projectId,
      code: b.code,
      label: b.label,
      allocatedBudget: b.allocatedBudget,
      currency: b.currency,
      active: b.active === "on",
    },
  });
  await logAudit({
    actorId: admin.id,
    actorRole: Role.ADMIN,
    action: "BUDGET_LINE_UPDATED",
    entityType: "BudgetLine",
    entityId: id,
    oldValue: `${before!.code} — ${before!.label}`,
    newValue: `${b.code} — ${b.label}`,
  });
  revalidatePath("/admin/budget-lines");
  redirect("/admin/budget-lines");
}
