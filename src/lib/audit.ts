import { prisma } from "@/lib/db";
import type { Role } from "@/lib/enums";

export async function logAudit(input: {
  actorId: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  comment?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      comment: input.comment ?? null,
      ipAddress: "10.0.0.42",
    },
  });
}
