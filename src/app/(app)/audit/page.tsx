import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { ROLE_LABELS } from "@/lib/workflow";
import { formatDateTime } from "@/lib/format";
import type { Role } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: {
    actor?: string;
    entity?: string;
    action?: string;
    from?: string;
    to?: string;
  };
}) {
  await requireUser();
  const [users, logs] = await Promise.all([
    prisma.user.findMany({ orderBy: { fullName: "asc" } }),
    prisma.auditLog.findMany({
      where: {
        ...(searchParams.actor ? { actorId: searchParams.actor } : {}),
        ...(searchParams.entity ? { entityType: searchParams.entity } : {}),
        ...(searchParams.action
          ? { action: { contains: searchParams.action } }
          : {}),
        ...(searchParams.from || searchParams.to
          ? {
              timestamp: {
                ...(searchParams.from
                  ? { gte: new Date(searchParams.from) }
                  : {}),
                ...(searchParams.to
                  ? { lte: new Date(searchParams.to + "T23:59:59") }
                  : {}),
              },
            }
          : {}),
      },
      orderBy: { timestamp: "desc" },
      include: { actor: true },
      take: 200,
    }),
  ]);
  const entityTypes = Array.from(new Set(logs.map((l) => l.entityType)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Journal d&apos;audit
          </h1>
          <p className="text-sm text-ink-500">
            Lecture seule — chaque événement est horodaté et associé à un acteur.
            La version production utilisera un stockage immuable (append-only,
            contre-signature et hash chaîné).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/print/audit"
            target="_blank"
            className="lift inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-soft hover:border-wwf-300"
          >
            Édition PDF officielle
          </Link>
          <a
            href="/api/export/audit"
            className="lift inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-soft hover:border-wwf-300"
          >
            Export CSV
          </a>
        </div>
      </div>

      <Card>
        <CardHeader title="Filtres" />
        <CardBody>
          <form
            method="GET"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            <select
              name="actor"
              defaultValue={searchParams.actor ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="">Tous acteurs</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
            <select
              name="entity"
              defaultValue={searchParams.entity ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="">Toutes entités</option>
              {entityTypes.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <input
              name="action"
              placeholder="Action (ex. APPROVAL_)"
              defaultValue={searchParams.action ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            />
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            />
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to ?? ""}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
            />
            <div className="col-span-2 flex gap-2 sm:col-span-3 lg:col-span-5">
              <button
                type="submit"
                className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                Appliquer
              </button>
              <Link
                href="/audit"
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-2.5 font-medium">Horodatage</th>
                  <th className="px-5 py-2.5 font-medium">Acteur</th>
                  <th className="px-5 py-2.5 font-medium">Rôle</th>
                  <th className="px-5 py-2.5 font-medium">Action</th>
                  <th className="px-5 py-2.5 font-medium">Entité</th>
                  <th className="px-5 py-2.5 font-medium">Avant</th>
                  <th className="px-5 py-2.5 font-medium">Après</th>
                  <th className="px-5 py-2.5 font-medium">Commentaire</th>
                  <th className="px-5 py-2.5 font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[12px]">
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-ink-50">
                    <td className="whitespace-nowrap px-5 py-2 text-ink-600">
                      {formatDateTime(l.timestamp)}
                    </td>
                    <td className="px-5 py-2 text-ink-800">
                      {l.actor?.fullName ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-ink-600">
                      {l.actorRole
                        ? ROLE_LABELS[l.actorRole as Role]
                        : "—"}
                    </td>
                    <td className="px-5 py-2 font-semibold text-ink-900">
                      {l.action}
                    </td>
                    <td className="px-5 py-2 text-ink-600">{l.entityType}</td>
                    <td className="px-5 py-2 text-ink-600">
                      {l.oldValue ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-ink-700">
                      {l.newValue ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-ink-600">
                      {l.comment ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-ink-500">
                      {l.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
