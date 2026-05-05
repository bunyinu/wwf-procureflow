import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { EmptyState } from "@/components/EmptyState";
import {
  PROCUREMENT_TYPE_LABEL,
  type ProcurementType,
} from "@/lib/enums";
import { STATUS_LABELS } from "@/lib/workflow";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RequisitionsPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    project?: string;
    department?: string;
    type?: string;
    priority?: string;
    requester?: string;
    scope?: string;
  };
}) {
  const user = await requireUser();

  // Role-scoped baseline filter. Requesters only see their own dossiers; other workflow roles get read-only operational scope.
  const role = user.role as string;
  const scopeMine = searchParams.scope === "mine" || role === "REQUESTER";
  const baseScope = scopeMine ? { requesterId: user.id } : {};

  const [departments, projects, requesters] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "REQUESTER" },
      orderBy: { fullName: "asc" },
    }),
  ]);

  const items = await prisma.purchaseRequisition.findMany({
    where: {
      ...baseScope,
      ...(searchParams.status ? { status: searchParams.status } : {}),
      ...(searchParams.project ? { projectId: searchParams.project } : {}),
      ...(searchParams.department
        ? { departmentId: searchParams.department }
        : {}),
      ...(searchParams.type ? { procurementType: searchParams.type } : {}),
      ...(searchParams.priority ? { priority: searchParams.priority } : {}),
      ...(!scopeMine && searchParams.requester
        ? { requesterId: searchParams.requester }
        : {}),
    },
    include: {
      requester: true,
      project: true,
      department: true,
      budgetLine: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const canCreate = role === "REQUESTER";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            {scopeMine ? "Mes réquisitions" : "Réquisitions"}
          </h1>
          <p className="text-sm text-ink-500">
            {scopeMine
              ? `Vos dossiers — ${items.length} au total.`
              : `${items.length} dossier${items.length > 1 ? "s" : ""} affiché${items.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/requisitions"
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-sm hover:bg-ink-50"
          >
            Export CSV
          </a>
          {canCreate ? (
            <Link
              href="/requisitions/new"
              className="rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-wwf-800"
            >
              + Nouvelle réquisition
            </Link>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader title="Filtres" description="Affinez la liste ci-dessous" />
        <CardBody>
          <form
            method="GET"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {scopeMine ? (
              <input type="hidden" name="scope" value="mine" />
            ) : null}
            <select
              name="status"
              defaultValue={searchParams.status ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="">Tous statuts</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              name="project"
              defaultValue={searchParams.project ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="">Tous projets</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              name="department"
              defaultValue={searchParams.department ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="">Tous départements</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={searchParams.type ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="">Tous types</option>
              {Object.entries(PROCUREMENT_TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              name="priority"
              defaultValue={searchParams.priority ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="">Toutes priorités</option>
              <option value="LOW">Faible</option>
              <option value="NORMAL">Normale</option>
              <option value="HIGH">Élevée</option>
              <option value="URGENT">Urgente</option>
            </select>
            {!scopeMine ? (
              <select
                name="requester"
                defaultValue={searchParams.requester ?? ""}
                className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
              >
                <option value="">Tous demandeurs</option>
                {requesters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName}
                  </option>
                ))}
              </select>
            ) : (
              <div />
            )}
            <div className="col-span-2 flex gap-2 sm:col-span-3 lg:col-span-6">
              <button
                type="submit"
                className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                Appliquer les filtres
              </button>
              <Link
                href={scopeMine ? "/requisitions?scope=mine" : "/requisitions"}
                className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                Réinitialiser
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="px-0 py-0">
          {items.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="Aucune réquisition trouvée"
                description="Ajustez les filtres ou créez une nouvelle réquisition."
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
                    <th className="px-5 py-2.5 font-medium">Projet</th>
                    <th className="px-5 py-2.5 font-medium">Type</th>
                    <th className="px-5 py-2.5 font-medium">Montant</th>
                    <th className="px-5 py-2.5 font-medium">Priorité</th>
                    <th className="px-5 py-2.5 font-medium">Statut</th>
                    <th className="px-5 py-2.5 font-medium">MAJ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-ink-50 transition hover:bg-ink-50/60"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-ink-500">
                        <Link
                          href={`/requisitions/${r.id}`}
                          className="hover:text-wwf-700"
                        >
                          {r.requisitionNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/requisitions/${r.id}`}
                          className="font-medium text-ink-900 hover:text-wwf-700"
                        >
                          {r.title}
                        </Link>
                        <div className="text-xs text-ink-500">
                          {r.department.name} · {r.budgetLine.code}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {r.requester.fullName}
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {r.project.projectCode}
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {
                          PROCUREMENT_TYPE_LABEL[
                            r.procurementType as ProcurementType
                          ]
                        }
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
                        {formatDate(r.updatedAt)}
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
