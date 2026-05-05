import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";
import { ROLE_LABELS } from "@/lib/workflow";
import type { Role } from "@/lib/enums";

export async function GET() {
  await requireUser();
  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { timestamp: "desc" },
    take: 1000,
  });
  const rows = logs.map((l) => [
    l.timestamp.toISOString(),
    l.actor?.fullName ?? "",
    l.actorRole ? ROLE_LABELS[l.actorRole as Role] : "",
    l.action,
    l.entityType,
    l.entityId,
    l.oldValue ?? "",
    l.newValue ?? "",
    l.comment ?? "",
    l.ipAddress ?? "",
  ]);
  const csv = toCsv(
    [
      "Horodatage",
      "Acteur",
      "Rôle",
      "Action",
      "Entité",
      "Identifiant",
      "Avant",
      "Après",
      "Commentaire",
      "IP",
    ],
    rows,
  );
  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(`audit_${today}.csv`, csv);
}
