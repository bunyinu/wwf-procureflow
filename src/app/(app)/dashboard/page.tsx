import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock,
  FileText,
  Gauge,
  Inbox,
  PackageCheck,
  PiggyBank,
  Plus,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
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
import {
  STATUS_LABELS,
  ROLE_LABELS,
} from "@/lib/workflow";
import {
  SUPPLIER_STATUS_LABEL,
  SUPPLIER_STATUS_BADGE,
  type SupplierStatus,
  type Role,
} from "@/lib/enums";
import { formatCurrency, relativeFromNow } from "@/lib/format";

export const dynamic = "force-dynamic";

const ROLE_HEADER: Record<Role, { eyebrow: string; description: string }> = {
  REQUESTER: {
    eyebrow: "Espace Demandeur",
    description: "Suivez vos demandes, lancez-en de nouvelles, recevez les décisions.",
  },
  MANAGER: {
    eyebrow: "Espace Manager",
    description: "Vos dossiers à approuver et l'activité de votre périmètre.",
  },
  PROCUREMENT: {
    eyebrow: "Espace Achats",
    description: "Pilotage des fournisseurs, des bons de commande et des réceptions.",
  },
  FINANCE: {
    eyebrow: "Espace Finance",
    description: "Validation des engagements et état de la trésorerie.",
  },
  AUDITOR: {
    eyebrow: "Espace Audit · lecture seule",
    description: "Vue exhaustive du portefeuille et indicateurs de conformité.",
  },
  ADMIN: {
    eyebrow: "Console administrateur",
    description: "Vue exécutive consolidée du portefeuille d'achats.",
  },
};

export default async function DashboardPage() {
  const user = await requireUser();
  const role = user.role as Role;

  // Common dataset (cheap queries, used by multiple roles).
  const [allReqs, suppliers, pos, recentLogs, departments] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      include: {
        requester: true,
        project: true,
        budgetLine: true,
        approvals: true,
        purchaseOrders: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.supplier.findMany(),
    prisma.purchaseOrder.findMany({
      include: { supplier: true, requisition: true },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { timestamp: "desc" },
      include: { actor: true },
    }),
    prisma.department.findMany(),
  ]);

  // Per-role base scope
  const myReqs = allReqs.filter((r) => r.requesterId === user.id);
  const reqsScope =
    role === "REQUESTER" ? myReqs : allReqs.filter((r) => r.status !== "CANCELLED");

  // Common derivations
  const totalCount = allReqs.length;
  const openStatuses = ["MANAGER_REVIEW", "PROCUREMENT_REVIEW", "FINANCE_REVIEW"];
  const overdueAll = allReqs.filter(
    (r) =>
      openStatuses.includes(r.status) &&
      r.submittedAt &&
      r.submittedAt.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 3,
  );
  // SLA respect across closed stages
  let stagesCounted = 0;
  let stagesRespected = 0;
  for (const r of allReqs) {
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
  const closedCycle = allReqs
    .filter((r) => r.status === "CLOSED" && r.submittedAt)
    .map((r) => (r.updatedAt.getTime() - r.submittedAt!.getTime()) / 86400000);
  const avgCycle =
    closedCycle.length > 0
      ? closedCycle.reduce((a, b) => a + b, 0) / closedCycle.length
      : null;

  // ---------- Role-specific tiles ----------
  let tiles: React.ReactNode = null;
  let primaryAction: React.ReactNode = null;

  if (role === "REQUESTER") {
    const myDrafts = myReqs.filter((r) => r.status === "DRAFT").length;
    const myInReview = myReqs.filter((r) => openStatuses.includes(r.status)).length;
    const myReceived = myReqs.filter(
      (r) => r.status === "RECEIVED" || r.status === "CLOSED",
    ).length;
    const myReturned = myReqs.filter(
      (r) => r.status === "RETURNED_FOR_REVISION",
    ).length;
    const myValue = myReqs.reduce((s, r) => s + r.amount, 0);
    tiles = (
      <>
        <Stat label="Mes réquisitions" value={myReqs.length} icon={FileText} tone="brand" hint="Tous statuts" />
        <Stat label="Mes brouillons" value={myDrafts} icon={ClipboardList} tone={myDrafts > 0 ? "warn" : "muted"} hint="À soumettre" />
        <Stat label="En cours d'approbation" value={myInReview} icon={Clock} hint="Manager · Achats · Finance" />
        <Stat label="À retravailler" value={myReturned} icon={AlertTriangle} tone={myReturned > 0 ? "warn" : "muted"} hint="Retournées par un validateur" />
        <Stat label="Reçues / clôturées" value={myReceived} icon={PackageCheck} tone="good" hint="Dossiers livrés" />
        <Stat label="Valeur cumulée" value={formatCurrency(myValue)} icon={CircleDollarSign} hint="USD, vos dossiers" />
      </>
    );
    primaryAction = (
      <Link
        href="/requisitions/new"
        className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-soft hover:bg-wwf-800"
      >
        <Plus className="h-4 w-4" />
        Nouvelle réquisition
      </Link>
    );
  } else if (role === "MANAGER") {
    const myQueue = allReqs.filter(
      (r) => r.currentApproverRole === "MANAGER" && openStatuses.includes(r.status),
    );
    const myDecisions = allReqs
      .flatMap((r) => r.approvals)
      .filter(
        (a) =>
          a.approverId === user.id &&
          a.decidedAt.getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7,
      );
    const lateMine = myQueue.filter(
      (r) =>
        r.submittedAt &&
        r.submittedAt.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 2,
    );
    tiles = (
      <>
        <Stat label="À traiter à mon niveau" value={myQueue.length} icon={Inbox} tone={myQueue.length > 0 ? "warn" : "good"} hint="Étape Revue Manager" />
        <Stat label="Décisions cette semaine" value={myDecisions.length} icon={CheckCircle2} tone="good" hint="Approbations + retours + rejets" />
        <Stat label="Retards à mon niveau" value={lateMine.length} icon={AlertTriangle} tone={lateMine.length > 0 ? "warn" : "muted"} hint=">2 jours sans décision" />
        <Stat label="Réquisitions du périmètre" value={totalCount} icon={FileText} tone="brand" hint="Tous statuts" />
        <Stat label="Cycle moyen (clôturées)" value={avgCycle !== null ? `${avgCycle.toFixed(1)} j` : "—"} icon={Clock} hint="Soumission → clôture" />
        <Stat label="Respect des SLA" value={slaRespectPct !== null ? `${slaRespectPct} %` : "—"} icon={Gauge} tone={slaRespectPct !== null && slaRespectPct >= 80 ? "good" : "warn"} hint="Étapes dans les délais" />
      </>
    );
    primaryAction = (
      <Link
        href="/approvals"
        className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-soft hover:bg-wwf-800"
      >
        <Inbox className="h-4 w-4" />
        Ouvrir ma file
      </Link>
    );
  } else if (role === "PROCUREMENT") {
    const myQueue = allReqs.filter(
      (r) => r.currentApproverRole === "PROCUREMENT" && openStatuses.includes(r.status),
    );
    const poToIssue = allReqs.filter(
      (r) => r.status === "PO_CREATED" && r.purchaseOrders.length === 0,
    ).length;
    const poIssued = pos.filter((p) => p.status === "ISSUED").length;
    const poReceived = pos.filter((p) => p.status === "RECEIVED").length;
    const supPrequal = suppliers.filter((s) => s.status === "PREQUALIFIED").length;
    const supDiligence = suppliers.filter(
      (s) => s.dueDiligenceStatus === "IN_REVIEW",
    ).length;
    tiles = (
      <>
        <Stat label="À traiter Achats" value={myQueue.length} icon={Inbox} tone={myQueue.length > 0 ? "warn" : "good"} hint="Étape Revue Achats" />
        <Stat label="PO à émettre" value={poToIssue} icon={ClipboardList} tone={poToIssue > 0 ? "warn" : "muted"} hint="Finance validée, sélection fournisseur" />
        <Stat label="PO en cours" value={poIssued} icon={ClipboardList} hint="Émis, en attente de réception" />
        <Stat label="Réceptions enregistrées" value={poReceived} icon={PackageCheck} tone="good" hint="GRN / SAN consignés" />
        <Stat label="Fournisseurs préqualifiés" value={supPrequal} icon={Truck} tone="good" hint={`${suppliers.length} au registre`} />
        <Stat label="Diligence en cours" value={supDiligence} icon={ShieldCheck} tone={supDiligence > 0 ? "warn" : "muted"} hint="Vérifications fournisseurs" />
      </>
    );
    primaryAction = (
      <Link
        href="/approvals"
        className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-soft hover:bg-wwf-800"
      >
        <Inbox className="h-4 w-4" />
        Ouvrir ma file
      </Link>
    );
  } else if (role === "FINANCE") {
    const myQueue = allReqs.filter(
      (r) => r.currentApproverRole === "FINANCE" && openStatuses.includes(r.status),
    );
    const totalEngaged = pos.reduce((s, p) => s + p.amount, 0);
    const budgetExceptions = allReqs.filter((r) => {
      const remaining =
        r.budgetLine.allocatedBudget -
        r.budgetLine.committedAmount -
        r.budgetLine.spentAmount;
      return r.amount > remaining;
    });
    tiles = (
      <>
        <Stat label="À valider Finance" value={myQueue.length} icon={Inbox} tone={myQueue.length > 0 ? "warn" : "good"} hint="Engagement budgétaire à approuver" />
        <Stat label="Exceptions budgétaires" value={budgetExceptions.length} icon={AlertTriangle} tone={budgetExceptions.length > 0 ? "warn" : "muted"} hint="Demande > solde restant" />
        <Stat label="Engagements actifs (PO)" value={formatCurrency(totalEngaged)} icon={Wallet} hint={`${pos.length} bons de commande`} />
        <Stat label="Cycle moyen" value={avgCycle !== null ? `${avgCycle.toFixed(1)} j` : "—"} icon={Clock} hint="Soumission → clôture" />
        <Stat label="Respect des SLA" value={slaRespectPct !== null ? `${slaRespectPct} %` : "—"} icon={Gauge} tone={slaRespectPct !== null && slaRespectPct >= 80 ? "good" : "warn"} hint="Étapes dans les délais" />
        <Stat label="Lignes budgétaires" value={`${departments.length}`} icon={PiggyBank} hint="Voir le grand livre" />
      </>
    );
    primaryAction = (
      <Link
        href="/finance/budget"
        className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-soft hover:bg-wwf-800"
      >
        <PiggyBank className="h-4 w-4" />
        Ouvrir le grand livre
      </Link>
    );
  } else if (role === "AUDITOR") {
    const totalEvents = recentLogs.length;
    const noAttestation = suppliers.filter(
      (s) => !s.antiCorruptionSignedAt,
    ).length;
    const rejected = allReqs.filter((r) => r.status === "REJECTED").length;
    const cancelled = allReqs.filter((r) => r.status === "CANCELLED").length;
    tiles = (
      <>
        <Stat label="Dossiers au portefeuille" value={totalCount} icon={FileText} tone="brand" hint="Tous statuts" />
        <Stat label="Respect des SLA" value={slaRespectPct !== null ? `${slaRespectPct} %` : "—"} icon={Gauge} tone={slaRespectPct !== null && slaRespectPct >= 80 ? "good" : "warn"} hint="Étapes dans les délais" />
        <Stat label="Retards en cours" value={overdueAll.length} icon={AlertTriangle} tone={overdueAll.length > 0 ? "warn" : "muted"} hint=">3 jours sans décision" />
        <Stat label="Annexe B manquante" value={noAttestation} icon={ShieldCheck} tone={noAttestation > 0 ? "warn" : "good"} hint="Fournisseurs sans attestation" />
        <Stat label="Rejets / annulations" value={rejected + cancelled} icon={Activity} hint={`${rejected} rejetées · ${cancelled} annulées`} />
        <Stat label="Évènements récents" value={totalEvents} icon={ShieldCheck} hint="Voir le journal d'audit" />
      </>
    );
    primaryAction = (
      <Link
        href="/audit"
        className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-soft hover:bg-wwf-800"
      >
        <ShieldCheck className="h-4 w-4" />
        Ouvrir le journal d&apos;audit
      </Link>
    );
  } else {
    // ADMIN
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { active: true } });
    const totalEvents = await prisma.auditLog.count();
    const supPrequal = suppliers.filter((s) => s.status === "PREQUALIFIED").length;
    const totalValue = allReqs.reduce((s, r) => s + r.amount, 0);
    tiles = (
      <>
        <Stat label="Réquisitions totales" value={totalCount} icon={FileText} tone="brand" hint="Tous statuts" />
        <Stat label="Valeur portefeuille" value={formatCurrency(totalValue)} icon={CircleDollarSign} tone="good" hint="USD, hors annulées" />
        <Stat label="Respect des SLA" value={slaRespectPct !== null ? `${slaRespectPct} %` : "—"} icon={Gauge} tone={slaRespectPct !== null && slaRespectPct >= 80 ? "good" : "warn"} hint="Étapes dans les délais" />
        <Stat label="Approbations en retard" value={overdueAll.length} icon={AlertTriangle} tone={overdueAll.length > 0 ? "warn" : "muted"} hint=">3 jours" />
        <Stat label="Comptes actifs" value={`${activeUsers}/${totalUsers}`} icon={Users} hint="Utilisateurs actifs / total" />
        <Stat label="Évènements audités" value={totalEvents} icon={ShieldCheck} hint={`${supPrequal} fournisseurs préqualifiés`} />
      </>
    );
    primaryAction = (
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3.5 py-2 text-sm font-medium text-white shadow-soft hover:bg-wwf-800"
      >
        <Users className="h-4 w-4" />
        Console administration
      </Link>
    );
  }

  // Status mix donut, computed on scoped reqs (so requester sees own; others see all)
  const byStatus = new Map<string, { count: number; value: number }>();
  for (const r of reqsScope) {
    const cur = byStatus.get(r.status) || { count: 0, value: 0 };
    cur.count += 1;
    cur.value += r.amount;
    byStatus.set(r.status, cur);
  }
  const donutData = Array.from(byStatus.entries())
    .sort((a, b) => b[1].value - a[1].value)
    .map(([s, info]) => ({
      name: s,
      label: STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s,
      value: info.count,
    }));

  // Sparkline cycle (closed reqs in scope)
  const cycleSparkline = (() => {
    const buckets: Record<string, number[]> = {};
    const closed = reqsScope.filter((r) => r.status === "CLOSED" && r.submittedAt);
    closed.forEach((r) => {
      const days = (r.updatedAt.getTime() - r.submittedAt!.getTime()) / 86400000;
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

  const visibleReqs =
    role === "REQUESTER" ? myReqs.slice(0, 6) : allReqs.slice(0, 6);

  const header = ROLE_HEADER[role];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-700">
            {header.eyebrow}
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
            Tableau de bord
          </h1>
          <p className="text-sm text-ink-500">
            Bonjour {user.fullName.split(" ")[0]} —{" "}
            {ROLE_LABELS[role]}. {header.description}
          </p>
        </div>
        {primaryAction}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tiles}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              role === "REQUESTER"
                ? "Mes dossiers par statut"
                : "Volume par statut"
            }
            description="Répartition des dossiers"
            action={
              <Link
                href={
                  role === "REQUESTER"
                    ? "/requisitions?scope=mine"
                    : "/requisitions"
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
              >
                Voir la liste
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="grid gap-6 lg:grid-cols-5">
            {donutData.length > 0 ? (
              <>
                <div className="lg:col-span-2">
                  <StatusDonut data={donutData} />
                </div>
                <div className="lg:col-span-3">
                  <ul className="space-y-2 text-sm">
                    {donutData.slice(0, 7).map((d) => {
                      const info = byStatus.get(d.name)!;
                      const pct = (info.count / reqsScope.length) * 100;
                      return (
                        <li
                          key={d.name}
                          className="flex items-center gap-3 rounded-md border border-ink-100 px-3 py-2"
                        >
                          <StatusBadge status={d.name} />
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
              </>
            ) : (
              <p className="lg:col-span-5 text-sm text-ink-500">
                Aucun dossier à afficher.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cycle moyen — tendance" description="6 dernières semaines (jours)" />
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
              role === "AUDITOR" || role === "ADMIN" ? (
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
                >
                  Voir le journal
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : undefined
            }
          />
          <CardBody className="space-y-2.5">
            {recentLogs.map((e) => (
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
            {role === "PROCUREMENT" || role === "ADMIN" ? (
              <Link
                href="/suppliers"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
              >
                Gérer le registre
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title={
            role === "REQUESTER"
              ? "Mes derniers dossiers"
              : "Réquisitions à suivre"
          }
          description="Dernières mises à jour"
          action={
            <Link
              href={
                role === "REQUESTER"
                  ? "/requisitions?scope=mine"
                  : "/requisitions"
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-wwf-700 hover:text-wwf-800"
            >
              Tout afficher
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <CardBody className="space-y-2">
          {visibleReqs.map((r) => (
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
    </div>
  );
}
