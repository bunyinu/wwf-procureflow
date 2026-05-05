import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  ClipboardList,
  Clock,
  FileText,
  Gauge,
  Inbox,
  PackageCheck,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { computeStageTimings } from "@/lib/sla";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Stat } from "@/components/Stat";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Badge } from "@/components/Badge";
import { StatusDonut } from "@/components/charts/StatusDonut";
import { CycleSparkline } from "@/components/charts/CycleSparkline";
import { STATUS_LABELS, ROLE_LABELS } from "@/lib/workflow";
import {
  SUPPLIER_STATUS_LABEL,
  SUPPLIER_STATUS_BADGE,
  type SupplierStatus,
} from "@/lib/enums";
import { formatCurrency, relativeFromNow } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const role = user.role as string;
  const scopeMine = role === "REQUESTER";
  const scopeFilter = scopeMine ? { requesterId: user.id } : {};

  const [
    requisitions,
    pendingApprovals,
    overdue,
    auditEvents,
    suppliers,
    pos,
  ] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: scopeFilter,
      include: {
        requester: true,
        project: true,
        budgetLine: true,
        approvals: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.purchaseRequisition.count({
      where: {
        ...scopeFilter,
        status: {
          in: [
            "SUBMITTED",
            "MANAGER_REVIEW",
            "PROCUREMENT_REVIEW",
            "FINANCE_REVIEW",
          ],
        },
        // For approvers, only count what's at their level
        ...(role === "MANAGER" || role === "PROCUREMENT" || role === "FINANCE"
          ? { currentApproverRole: role }
          : {}),
      },
    }),
    prisma.purchaseRequisition.findMany({
      where: {
        ...scopeFilter,
        status: {
          in: ["MANAGER_REVIEW", "PROCUREMENT_REVIEW", "FINANCE_REVIEW"],
        },
        submittedAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
        ...(role === "MANAGER" || role === "PROCUREMENT" || role === "FINANCE"
          ? { currentApproverRole: role }
          : {}),
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 8,
      include: { actor: true },
    }),
    prisma.supplier.findMany(),
    prisma.purchaseOrder.findMany({
      include: { supplier: true, requisition: true },
    }),
  ]);

  const totalCount = requisitions.length;
  const totalValue = requisitions.reduce((s, r) => s + r.amount, 0);
  const closedCycle = requisitions
    .filter((r) => r.status === "CLOSED" && r.submittedAt)
    .map((r) => (r.updatedAt.getTime() - r.submittedAt!.getTime()) / 86400000);
  const avgCycle =
    closedCycle.length > 0
      ? closedCycle.reduce((a, b) => a + b, 0) / closedCycle.length
      : null;

  const budgetExceptions = requisitions.filter((r) => {
    const remaining =
      r.budgetLine.allocatedBudget -
      r.budgetLine.committedAmount -
      r.budgetLine.spentAmount;
    return r.amount > remaining;
  });

  const byStatus = new Map<string, { count: number; value: number }>();
  for (const r of requisitions) {
    const cur = byStatus.get(r.status) || { count: 0, value: 0 };
    cur.count += 1;
    cur.value += r.amount;
    byStatus.set(r.status, cur);
  }
  const statusRows = Array.from(byStatus.entries()).sort(
    (a, b) => b[1].value - a[1].value,
  );
  const donutData = statusRows.map(([s, info]) => ({
    name: s,
    label: STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s,
    value: info.count,
  }));

  // Build a synthetic 6-week cycle sparkline from closed requisitions
  const cycleSparkline = (() => {
    const buckets: Record<string, number[]> = {};
    const closed = requisitions.filter(
      (r) => r.status === "CLOSED" && r.submittedAt,
    );
    closed.forEach((r) => {
      const days =
        (r.updatedAt.getTime() - r.submittedAt!.getTime()) / 86400000;
      const week = `S${Math.ceil(
        (Date.now() - r.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 7),
      )}`;
      buckets[week] = buckets[week] || [];
      buckets[week].push(days);
    });
    const filler: { week: string; days: number }[] = [];
    for (let i = 6; i >= 1; i--) {
      const key = `S${i}`;
      const arr = buckets[key];
      filler.push({
        week: key,
        days: arr ? arr.reduce((a, b) => a + b, 0) / arr.length : avgCycle ?? 12,
      });
    }
    return filler;
  })();

  const supplierGroups = suppliers.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  // SLA respect: percentage of *completed* stages that finished within their
  // SLA target. Append-only — pure derivation from approvals + creation.
  let stagesCounted = 0;
  let stagesRespected = 0;
  for (const r of requisitions) {
    const t = computeStageTimings({
      submittedAt: r.submittedAt,
      createdAt: r.createdAt,
      status: r.status,
      approvals: r.approvals.map((a) => ({
        decidedAt: a.decidedAt,
        oldStatus: a.oldStatus,
        newStatus: a.newStatus,
      })),
    });
    for (const stage of t) {
      if (stage.exitedAt && stage.slaDays > 0) {
        stagesCounted += 1;
        if (!stage.overdue) stagesRespected += 1;
      }
    }
  }
  const slaRespectPct =
    stagesCounted > 0 ? Math.round((stagesRespected / stagesCounted) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-wwf-700">
            {scopeMine
              ? "Vue Demandeur"
              : role === "MANAGER"
                ? "Vue Manager"
                : role === "PROCUREMENT"
                  ? "Vue Achats"
                  : role === "FINANCE"
                    ? "Vue Finance"
                    : role === "AUDITOR"
                      ? "Vue Audit · lecture seule"
                      : "Vue exécutive"}
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
            Tableau de bord
          </h1>
          <p className="text-sm text-ink-500">
            Bonjour {user.fullName.split(" ")[0]} —{" "}
            {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}.{" "}
            {scopeMine
              ? "Voici l'état de vos demandes d'achat."
              : role === "AUDITOR"
                ? "Vous accédez à l'ensemble du portefeuille en lecture seule."
                : "Voici l'état du portefeuille d'achats relevant de votre périmètre."}
          </p>
        </div>
        {["REQUESTER", "ADMIN"].includes(role) ? (
          <Link
            href="/requisitions/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-wwf-800"
          >
            <Plus className="h-4 w-4" />
            Nouvelle réquisition
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={scopeMine ? "Mes réquisitions" : "Réquisitions totales"}
          value={totalCount}
          hint="Tous statuts confondus"
          icon={FileText}
          tone="brand"
        />
        <Stat
          label={
            role === "MANAGER" || role === "PROCUREMENT" || role === "FINANCE"
              ? "À traiter à mon niveau"
              : scopeMine
                ? "En attente côté validateurs"
                : "En attente d'approbation"
          }
          value={pendingApprovals}
          hint={
            role === "MANAGER"
              ? "Étape Revue Manager"
              : role === "PROCUREMENT"
                ? "Étape Revue Achats"
                : role === "FINANCE"
                  ? "Étape Revue Finance"
                  : "Manager · Achats · Finance"
          }
          icon={Inbox}
          tone={pendingApprovals > 0 ? "warn" : "good"}
        />
        <Stat
          label="Cycle moyen (clôturées)"
          value={avgCycle !== null ? `${avgCycle.toFixed(1)} j` : "—"}
          hint="Soumission → clôture"
          icon={Clock}
        />
        <Stat
          label="Valeur portefeuille"
          value={formatCurrency(totalValue)}
          hint="USD, hors annulées"
          icon={CircleDollarSign}
          tone="good"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Respect des SLA"
          value={slaRespectPct !== null ? `${slaRespectPct} %` : "—"}
          hint="Étapes clôturées dans les délais"
          icon={Gauge}
          tone={
            slaRespectPct === null
              ? "muted"
              : slaRespectPct >= 80
                ? "good"
                : "warn"
          }
        />
        <Stat
          label="Approbations en retard"
          value={overdue.length}
          hint=">3 jours sans décision"
          icon={AlertTriangle}
          tone={overdue.length > 0 ? "warn" : "muted"}
        />
        <Stat
          label="Exceptions budgétaires"
          value={budgetExceptions.length}
          hint="Montant > reste budget"
          icon={ShieldCheck}
          tone={budgetExceptions.length > 0 ? "warn" : "muted"}
        />
        <Stat
          label="Bons de commande"
          value={pos.length}
          hint={`${pos.filter((p) => p.status === "RECEIVED").length} reçus`}
          icon={ClipboardList}
        />
        <Stat
          label="Fournisseurs"
          value={suppliers.length}
          hint={`${suppliers.filter((s) => s.status === "PREQUALIFIED").length} préqualifiés`}
          icon={Truck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Volume par statut"
            description="Répartition des réquisitions sur le cycle complet"
            action={
              <Link
                href="/requisitions"
                className="inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
              >
                Voir la liste
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <StatusDonut data={donutData} />
            </div>
            <div className="lg:col-span-3">
              <ul className="space-y-2 text-sm">
                {statusRows.slice(0, 7).map(([status, info]) => {
                  const pct = (info.count / totalCount) * 100;
                  return (
                    <li
                      key={status}
                      className="flex items-center gap-3 rounded-md border border-ink-100 px-3 py-2"
                    >
                      <StatusBadge status={status} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-ink-500">
                            {info.count} dossier{info.count > 1 ? "s" : ""}
                          </span>
                          <span className="font-medium text-ink-800">
                            {formatCurrency(info.value)}
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-ink-100">
                          <div
                            className="h-full bg-wwf-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Cycle moyen — tendance"
            description="6 dernières semaines (jours)"
          />
          <CardBody>
            <CycleSparkline data={cycleSparkline} />
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-ink-100 pt-3 text-center">
              <div>
                <div className="text-lg font-semibold text-ink-900">
                  {avgCycle ? avgCycle.toFixed(1) : "—"}
                </div>
                <div className="text-[10.5px] uppercase tracking-wide text-ink-500">
                  Moyen
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-wwf-700">
                  {Math.min(...cycleSparkline.map((c) => c.days)).toFixed(1)}
                </div>
                <div className="text-[10.5px] uppercase tracking-wide text-ink-500">
                  Meilleur
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-700">
                  {Math.max(...cycleSparkline.map((c) => c.days)).toFixed(1)}
                </div>
                <div className="text-[10.5px] uppercase tracking-wide text-ink-500">
                  Pic
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Activité récente"
            description="Dernières actions consignées au journal d'audit"
            action={
              <Link
                href="/audit"
                className="inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
              >
                Voir le journal
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="space-y-2.5">
            {auditEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 rounded-md border border-ink-100 bg-white px-3 py-2"
              >
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                  <Activity className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-800">
                    {e.action}
                  </div>
                  <div className="truncate text-xs text-ink-500">
                    {e.actor?.fullName ?? "Système"} · {e.entityType}
                    {e.comment ? ` — ${e.comment}` : ""}
                  </div>
                </div>
                <div className="shrink-0 text-[11px] text-ink-400">
                  {relativeFromNow(e.timestamp)}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fournisseurs" description="Statut consolidé" />
          <CardBody className="space-y-2">
            {Object.entries(supplierGroups).map(([s, n]) => (
              <div
                key={s}
                className="flex items-center justify-between rounded-md border border-ink-100 px-3 py-2 text-sm"
              >
                <Badge className={SUPPLIER_STATUS_BADGE[s as SupplierStatus]}>
                  {SUPPLIER_STATUS_LABEL[s as SupplierStatus]}
                </Badge>
                <span className="font-medium text-ink-900">{n}</span>
              </div>
            ))}
            <Link
              href="/suppliers"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
            >
              Gérer le registre
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Réquisitions à suivre"
          description="Dernières mises à jour"
          action={
            <Link
              href="/requisitions"
              className="inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
            >
              Tout afficher
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <CardBody className="space-y-2">
          {requisitions.slice(0, 6).map((r) => (
            <Link
              href={`/requisitions/${r.id}`}
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-md border border-ink-100 px-3 py-2.5 transition hover:border-wwf-200 hover:bg-wwf-50/30"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink-900">
                  {r.title}
                </div>
                <div className="truncate text-xs text-ink-500">
                  <span className="font-mono">{r.requisitionNumber}</span>
                  {" · "}
                  {r.requester.fullName}
                  {" · "}
                  {r.project.projectCode}
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <span className="font-medium text-ink-800">
                  {formatCurrency(r.amount, r.currency)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PriorityBadge priority={r.priority} />
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))}
        </CardBody>
      </Card>

      <div className="rounded-lg border border-ink-200 bg-white px-4 py-3 text-[11px] text-ink-500">
        <span className="mr-2 inline-flex items-center gap-1 font-medium text-ink-700">
          <PackageCheck className="h-3 w-3" />
          Légende des statuts :
        </span>
        <span className="inline-flex flex-wrap gap-1.5 align-middle">
          {Object.keys(STATUS_LABELS).map((k) => (
            <StatusBadge key={k} status={k} />
          ))}
        </span>
      </div>
    </div>
  );
}
