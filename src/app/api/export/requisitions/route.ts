import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";
import { STATUS_LABELS } from "@/lib/workflow";
import {
  PROCUREMENT_TYPE_LABEL,
  PRIORITY_LABEL,
  type Priority,
  type ProcurementType,
} from "@/lib/enums";

export async function GET() {
  await requireUser();
  const items = await prisma.purchaseRequisition.findMany({
    include: {
      requester: true,
      project: true,
      department: true,
      budgetLine: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const rows = items.map((r) => [
    r.requisitionNumber,
    r.title,
    r.requester.fullName,
    r.department.name,
    r.project.projectCode,
    r.budgetLine.code,
    r.quantity,
    r.unit,
    r.amount,
    r.currency,
    PROCUREMENT_TYPE_LABEL[r.procurementType as ProcurementType] ?? r.procurementType,
    PRIORITY_LABEL[r.priority as Priority] ?? r.priority,
    STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] ?? r.status,
    r.submittedAt?.toISOString() ?? "",
    r.expectedDeliveryDate?.toISOString() ?? "",
    r.createdAt.toISOString(),
    r.updatedAt.toISOString(),
  ]);
  const csv = toCsv(
    [
      "N°",
      "Objet",
      "Demandeur",
      "Département",
      "Projet",
      "Ligne budget.",
      "Quantité",
      "Unité",
      "Montant",
      "Devise",
      "Type",
      "Priorité",
      "Statut",
      "Soumise",
      "Livraison souhaitée",
      "Créée",
      "MAJ",
    ],
    rows,
  );
  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(`requisitions_${today}.csv`, csv);
}
