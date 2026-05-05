import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import {
  PROCUREMENT_TYPE_LABEL,
  PRIORITY_LABEL,
  type Priority,
  type ProcurementType,
} from "@/lib/enums";
import { STATUS_LABELS, ROLE_LABELS } from "@/lib/workflow";
import {
  PdfMeta,
  PdfParty,
  PdfSectionTitle,
  PdfSignatureBlock,
  PrintShell,
} from "@/components/print/PrintShell";
import type { Role } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function PrintableRequisition({
  params,
}: {
  params: { id: string };
}) {
  await requireUser();
  const r = await prisma.purchaseRequisition.findUnique({
    where: { id: params.id },
    include: {
      requester: true,
      department: true,
      project: true,
      budgetLine: true,
      approvals: { include: { approver: true }, orderBy: { decidedAt: "asc" } },
    },
  });
  if (!r) notFound();

  return (
    <PrintShell
      documentLabel="Réquisition d'Achat"
      documentNumber={r.requisitionNumber}
      classification="Officiel · Demande d'engagement"
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[26px] font-semibold leading-none tracking-tight text-ink-900">
            {r.title}
          </h1>
          <p className="mt-2 text-[12px] text-ink-600">
            Demande d&apos;achat soumise dans le cadre du projet{" "}
            <span className="text-ink-800">{r.project.projectCode}</span>.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700">
            Statut
          </div>
          <div className="font-serif text-[15px] font-semibold text-ink-900">
            {STATUS_LABELS[r.status as keyof typeof STATUS_LABELS]}
          </div>
        </div>
      </div>

      <PdfSectionTitle>Identification</PdfSectionTitle>
      <PdfMeta
        items={[
          { label: "Demandeur", value: r.requester.fullName },
          { label: "Département", value: r.department.name },
          { label: "Projet", value: r.project.projectCode },
          { label: "Ligne budgétaire", value: r.budgetLine.code },
          {
            label: "Type de procédure",
            value: PROCUREMENT_TYPE_LABEL[r.procurementType as ProcurementType],
          },
          {
            label: "Priorité",
            value: PRIORITY_LABEL[r.priority as Priority],
          },
        ]}
      />

      <div className="mt-8">
        <PdfSectionTitle>Détail de la demande</PdfSectionTitle>
        <div className="overflow-hidden rounded-sm border border-ink-300 bg-white">
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr className="bg-gradient-to-b from-ink-100 to-ink-50/40 text-left">
                <th className="px-4 py-2.5 font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Désignation
                </th>
                <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Quantité
                </th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Unité
                </th>
                <th className="px-4 py-2.5 text-right font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-t border-ink-200 px-4 py-3 font-semibold text-ink-900">
                  {r.title}
                </td>
                <td className="border-t border-ink-200 px-3 py-3 text-right font-mono">
                  {r.quantity.toLocaleString("fr-FR")}
                </td>
                <td className="border-t border-ink-200 px-3 py-3">{r.unit}</td>
                <td className="border-t border-ink-200 px-4 py-3 text-right font-mono font-semibold">
                  {formatCurrency(r.amount, r.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <PdfSectionTitle>Justification</PdfSectionTitle>
        <p className="whitespace-pre-line rounded-sm border border-ink-200 bg-white/70 p-4 text-[11.5px] text-ink-800">
          {r.justification}
        </p>
      </div>

      <div className="mt-6">
        <PdfSectionTitle>Historique d&apos;approbation</PdfSectionTitle>
        <div className="overflow-hidden rounded-sm border border-ink-300 bg-white">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-ink-50 text-left text-[9.5px] uppercase tracking-wider text-ink-700">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Acteur</th>
                <th className="px-3 py-2 font-semibold">Étape</th>
                <th className="px-3 py-2 font-semibold">Décision</th>
                <th className="px-3 py-2 font-semibold">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-t border-ink-200 px-3 py-2 font-mono text-[10.5px]">
                  {formatDateTime(r.createdAt)}
                </td>
                <td className="border-t border-ink-200 px-3 py-2">
                  {r.requester.fullName}
                </td>
                <td className="border-t border-ink-200 px-3 py-2 italic text-ink-600">
                  Création
                </td>
                <td className="border-t border-ink-200 px-3 py-2">
                  {r.submittedAt ? "Soumise" : "Brouillon"}
                </td>
                <td className="border-t border-ink-200 px-3 py-2 text-ink-500">—</td>
              </tr>
              {r.approvals.map((a) => (
                <tr key={a.id}>
                  <td className="border-t border-ink-200 px-3 py-2 font-mono text-[10.5px]">
                    {formatDateTime(a.decidedAt)}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-2">
                    {a.approver.fullName}{" "}
                    <span className="text-ink-500">
                      ({ROLE_LABELS[a.approverRole as Role]})
                    </span>
                  </td>
                  <td className="border-t border-ink-200 px-3 py-2 italic text-ink-600">
                    {STATUS_LABELS[a.oldStatus as keyof typeof STATUS_LABELS]}{" "}
                    →{" "}
                    {STATUS_LABELS[a.newStatus as keyof typeof STATUS_LABELS]}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-2">
                    {a.decision === "APPROVED"
                      ? "Approuvé"
                      : a.decision === "REJECTED"
                        ? "Rejeté"
                        : "Retourné"}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-2 text-ink-700">
                    {a.comment ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PdfSignatureBlock
        signatures={[
          { role: "Demandeur", line: "Signature de l'émetteur" },
          { role: "Manager", line: "Visa hiérarchique" },
          { role: "Achats", line: "Pour conformité procédure" },
        ]}
      />

      <div className="mt-8 flex items-center justify-between border-t border-ink-200 pt-3 text-[9.5px] text-ink-500">
        <span>
          Réquisition {r.requisitionNumber} · Émise le {formatDate(r.createdAt)}
        </span>
        <span>Page 1 / 1</span>
      </div>
    </PrintShell>
  );
}
