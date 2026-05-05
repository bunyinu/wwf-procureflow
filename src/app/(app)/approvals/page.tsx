import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { EmptyState } from "@/components/EmptyState";
import { ROLE_LABELS } from "@/lib/workflow";
import { formatCurrency, relativeFromNow } from "@/lib/format";
import type { Role } from "@/lib/enums";

export const dynamic = "force-dynamic";

const STATUSES_BY_ROLE: Partial<Record<Role, string[]>> = {
  // APPROVER owns all hierarchical threshold tiers
  APPROVER: ["HIERARCHICAL_REVIEW", "THRESHOLD_REVIEW", "SUBMITTED"],
  PROCUREMENT: ["PROCUREMENT_REVIEW"],
};

export default async function ApprovalsPage() {
  const user = await requireRole("APPROVER", "PROCUREMENT");
  const role = user.role as Role;
  const statuses = STATUSES_BY_ROLE[role] ?? [];

  if (statuses.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          File d&apos;approbation
        </h1>
        <Card>
          <CardBody>
            <EmptyState
              title="Aucune action à votre niveau"
              description={`Le rôle ${ROLE_LABELS[role]} ne dispose pas d'étape d'approbation. Consultez vos réquisitions ou rapports.`}
              action={
                <Link
                  href="/requisitions"
                  className="rounded-md bg-wwf-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-wwf-700"
                >
                  Voir les réquisitions
                </Link>
              }
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  const items = await prisma.purchaseRequisition.findMany({
    where: { status: { in: statuses } },
    include: { requester: true, project: true, department: true, budgetLine: true },
    orderBy: [{ priority: "desc" }, { submittedAt: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          File d&apos;approbation
        </h1>
        <p className="text-sm text-ink-500">
          {items.length} dossier{items.length > 1 ? "s" : ""} en attente —
          étape : {ROLE_LABELS[role]}.
        </p>
      </div>

      <Card>
        <CardBody className="px-0 py-0">
          {items.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="File vide"
                description="Aucune réquisition ne nécessite votre intervention pour le moment."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">N°</th>
                    <th className="px-5 py-2.5 font-medium">Objet</th>
                    <th className="px-5 py-2.5 font-medium">Demandeur</th>
                    <th className="px-5 py-2.5 font-medium">Montant</th>
                    <th className="px-5 py-2.5 font-medium">Priorité</th>
                    <th className="px-5 py-2.5 font-medium">Statut</th>
                    <th className="px-5 py-2.5 font-medium">Soumise</th>
                    <th className="px-5 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-ink-50 transition hover:bg-ink-50/50"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-ink-500">
                        {r.requisitionNumber}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink-900">
                          {r.title}
                        </div>
                        <div className="text-xs text-ink-500">
                          {r.department.name} · {r.project.projectCode}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {r.requester.fullName}
                      </td>
                      <td className="px-5 py-3 font-medium text-ink-900">
                        {formatCurrency(r.amount, r.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-500">
                        {relativeFromNow(r.submittedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/requisitions/${r.id}`}
                          className="rounded-md bg-wwf-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-wwf-700"
                        >
                          Examiner →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
