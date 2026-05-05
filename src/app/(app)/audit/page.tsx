import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { ROLE_LABELS } from "@/lib/workflow";
import { formatDateTime } from "@/lib/format";
import type { Role } from "@/lib/enums";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: {
    actor?: string;
    entity?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: string;
  };
}) {
  await requireRole("AUDITOR");
  const where = {
    ...(searchParams.actor ? { actorId: searchParams.actor } : {}),
    ...(searchParams.entity ? { entityType: searchParams.entity } : {}),
    ...(searchParams.action
      ? { action: { contains: searchParams.action, mode: "insensitive" as const } }
      : {}),
    ...(searchParams.from || searchParams.to
      ? {
          timestamp: {
            ...(searchParams.from ? { gte: new Date(searchParams.from) } : {}),
            ...(searchParams.to
              ? { lte: new Date(searchParams.to + "T23:59:59") }
              : {}),
          },
        }
      : {}),
  };

  const [users, total, logs, allEntities] = await Promise.all([
    prisma.user.findMany({ orderBy: { fullName: "asc" } }),
    prisma.auditLog.count({ where }),
    (async () => {
      const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
      return prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        include: { actor: true },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
    })(),
    prisma.auditLog
      .findMany({ select: { entityType: true }, distinct: ["entityType"] })
      .then((rows) => rows.map((r) => r.entityType)),
  ]);

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function makeHref(extra: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...searchParams, ...extra };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, String(v));
    }
    const qs = p.toString();
    return `/audit${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-700">
            Conformité & traçabilité
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
            Journal d&apos;audit
          </h1>
          <p className="text-sm text-ink-500">
            Lecture seule — chaque évènement est horodaté, signé par
            l&apos;acteur et conservé sans modification possible. {total}{" "}
            évènement{total > 1 ? "s" : ""} consignés.
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
              {allEntities.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <input
              name="action"
              placeholder="Action (ex. APPROVAL)"
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
                </tr>
              </thead>
              <tbody className="text-[12.5px]">
                {logs.map((l, i) => (
                  <tr
                    key={l.id}
                    className={`border-b border-ink-50 ${i % 2 === 0 ? "bg-white" : "bg-ink-50/30"}`}
                  >
                    <td className="whitespace-nowrap px-5 py-2 font-mono text-[11px] text-ink-600">
                      {formatDateTime(l.timestamp)}
                    </td>
                    <td className="px-5 py-2 text-ink-800">
                      {l.actor?.fullName ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-ink-600">
                      {l.actorRole ? ROLE_LABELS[l.actorRole as Role] : "—"}
                    </td>
                    <td className="px-5 py-2 font-mono text-[11.5px] font-semibold text-ink-900">
                      {l.action}
                    </td>
                    <td className="px-5 py-2 text-ink-600">{l.entityType}</td>
                    <td className="px-5 py-2 text-ink-600">{l.oldValue ?? "—"}</td>
                    <td className="px-5 py-2 text-ink-700">{l.newValue ?? "—"}</td>
                    <td className="px-5 py-2 text-ink-600">{l.comment ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between rounded-md border border-ink-200 bg-white px-4 py-2 text-xs text-ink-600">
        <span>
          Page {page} sur {totalPages} · {total} évènement
          {total > 1 ? "s" : ""} au total
        </span>
        <div className="flex gap-2">
          <Link
            href={makeHref({ page: String(Math.max(1, page - 1)) })}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${
              page === 1
                ? "pointer-events-none border-ink-100 text-ink-400"
                : "border-ink-200 hover:bg-ink-50"
            }`}
          >
            <ChevronLeft className="h-3 w-3" />
            Précédent
          </Link>
          <Link
            href={makeHref({ page: String(Math.min(totalPages, page + 1)) })}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${
              page === totalPages
                ? "pointer-events-none border-ink-100 text-ink-400"
                : "border-ink-200 hover:bg-ink-50"
            }`}
          >
            Suivant
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
