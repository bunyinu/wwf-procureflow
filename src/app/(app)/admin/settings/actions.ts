"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { assertCan } from "@/lib/permissions";
import { Role } from "@/lib/enums";

export async function updateSettingsAction(formData: FormData) {
  const admin = await requireUser();
  assertCan(admin, "update", "setting", {}, "/admin/settings?denied=1");
  const entries = Array.from(formData.entries()).filter(([key]) =>
    key.startsWith("setting:"),
  );
  for (const [k, v] of entries) {
    const id = k.replace("setting:", "");
    const value = String(v);
    const before = await prisma.setting.findUnique({ where: { id } });
    await prisma.setting.upsert({
      where: { id },
      update: { value },
      create: { id, value },
    });
    if (!before || before.value !== value) {
      await logAudit({
        actorId: admin.id,
        actorRole: Role.ADMIN,
        action: "SETTING_UPDATED",
        entityType: "Setting",
        entityId: id,
        oldValue: before?.value ?? null,
        newValue: value,
      });
    }
  }
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
