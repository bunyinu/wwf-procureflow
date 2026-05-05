import {
  Award,
  BarChart3,
  Building2,
  Download,
  FileSpreadsheet,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { TypeBars } from "@/components/charts/TypeBars";
import { BudgetBars } from "@/components/charts/BudgetBars";
import {
  PROCUREMENT_TYPE_LABEL,
  type ProcurementType,
} from "@/lib/enums";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireRole("REPORTING");
  const [requisitions, suppliers, budgetLines, projects, departments] =
    await Promise.all([
      prisma.purchaseRequisition.findMany({
        include: {
          department: true,
          project: true,
          budgetLine: true,
          purchaseOrders: { include: { supplier: true } },
        },
      }),
      prisma.supplier.findMany({
        include: { purchaseOrders: true },
      }),
      prisma.budgetLine.findMany({ include: { project: true } }),
      prisma.project.findMany(),
      prisma.department.findMany(),
    ]);

  const cycleByDept = new Map<string, { sum: number; count: number }>();
  for (const r of requisitions) {
    if (r.status === "CLOSED" && r.submittedAt) {
      const days = (r.updatedAt.getTime() - r.submittedAt.getTime()) / 86400000;
      const cur = cycleByDept.get(r.department.name) || { sum: 0, count: 0 };
      cur.sum += days;
      cur.count += 1;
      cycleByDept.set(r.department.name, cur);
    }
  }

  const byProject = projects.map((p) => {
    const list = requisitions.filter((r) => r.projectId === p.id);
    return {
      project: p,
      count: list.length,
      value: list.reduce((s, r) => s + r.amount, 0),
    };
  });

  const byTypeMap = new Map<string, number>();
  for (const r of requisitions) {
    byTypeMap.set(
      r.procurementType,
      (byTypeMap.get(r.procurementType) || 0) + r.amount,
    );
  }
  const byTypeData = Array.from(byTypeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({
      name: PROCUREMENT_TYPE_LABEL[k as ProcurementType] ?? k,
      value: v,
    }));

  const supplierRows = suppliers
    .map((s) => ({
      name: s.companyName,
      poCount: s.purchaseOrders.length,
      value: s.purchaseOrders.reduce((sum, po) => sum + po.amount, 0),
      score: s.score,
    }))
    .sort((a, b) => b.value - a.value);

  const budgetRows = budgetLines.map((b) => {
    const used = b.spentAmount + b.committedAmount;
    return {
      ...b,
      used,
      pct: (used / b.allocatedBudget) * 100,
    };
  });

  const budgetChart = budgetRows.map((b) => ({
    code: b.code,
    pct: b.pct,
  }));

  const deptRows = departments.map((d) => {
    const list = requisitions.filter((r) => r.departmentId === d.id);
    return {
      name: d.name,
      count: list.length,
      value: list.reduce((s, r) => s + r.amount, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-wwf-700">
            Pilotage analytique
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            Rapports
          </h1>
          <p className="text-sm text-ink-500">
            Indicateurs agrégés et exportables — vues bailleur, direction et
            audit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/export/requisitions"
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export réquisitions (CSV)
          </a>
          <a
            href="/api/export/budget"
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export consommation budget (CSV)
          </a>
          <a
            href="/api/export/audit"
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export journal audit (CSV)
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Valeur par type de procédure"
            description="USD cumulés"
          />
          <CardBody>
            <TypeBars data={byTypeData} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Cycle moyen par département"
            description="Jours entre soumission et clôture"
          />
          <CardBody className="space-y-3">
            {cycleByDept.size === 0 ? (
              <p className="text-xs text-ink-500">
                Pas encore de réquisition clôturée pour calculer un cycle.
              </p>
            ) : (
              Array.from(cycleByDept.entries()).map(([name, info]) => {
                const value = info.sum / info.count;
                return (
                  <Row
                    key={name}
                    label={name}
                    value={`${value.toFixed(1)} j`}
                    ratio={Math.min(value / 30, 1)}
                  />
                );
              })
            )}
            <div className="border-t border-ink-100 pt-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
                Volume par département
              </div>
              <div className="mt-2 space-y-2">
                {deptRows.map((d) => (
                  <Row
                    key={d.name}
                    label={d.name}
                    value={`${d.count} · ${formatCurrency(d.value)}`}
                    ratio={
                      d.count /
                      Math.max(...deptRows.map((x) => x.count), 1)
                    }
                    tone="alt"
                  />
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Réquisitions par projet"
            description="Tous statuts confondus"
          />
          <CardBody className="px-0 py-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-2.5 font-medium">Projet</th>
                  <th className="px-5 py-2.5 font-medium">Bailleur</th>
                  <th className="px-5 py-2.5 font-medium text-right">PR</th>
                  <th className="px-5 py-2.5 font-medium text-right">Valeur</th>
                </tr>
              </thead>
              <tbody>
                {byProject.map((p) => (
                  <tr
                    key={p.project.id}
                    className="border-b border-ink-50 last:border-none"
                  >
                    <td className="px-5 py-2.5">
                      <div className="font-medium text-ink-800">
                        {p.project.name}
                      </div>
                      <div className="font-mono text-[11px] text-ink-500">
                        {p.project.projectCode}
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-ink-500">
                      {p.project.donor ?? "—"}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium text-ink-900">
                      {p.count}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {formatCurrency(p.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Performance fournisseurs"
            description="Score qualitatif et engagement"
          />
          <CardBody className="px-0 py-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-2.5 font-medium">Fournisseur</th>
                  <th className="px-5 py-2.5 font-medium text-right">PO</th>
                  <th className="px-5 py-2.5 font-medium text-right">Valeur</th>
                  <th className="px-5 py-2.5 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {supplierRows.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-ink-50 last:border-none"
                  >
                    <td className="px-5 py-2.5">{s.name}</td>
                    <td className="px-5 py-2.5 text-right">{s.poCount}</td>
                    <td className="px-5 py-2.5 text-right">
                      {formatCurrency(s.value)}
                    </td>
                    <td className="px-5 py-2.5">
                      <Badge
                        className={
                          s.score >= 75
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : s.score >= 50
                              ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                              : "bg-red-50 text-red-700 ring-1 ring-red-200"
                        }
                      >
                        {s.score}/100
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Consommation budgétaire"
          description="Engagé + dépensé / alloué — par ligne"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-ink-500">
              <PiggyBank className="h-3.5 w-3.5" />
              {budgetRows.length} lignes
            </span>
          }
        />
        <CardBody className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BudgetBars data={budgetChart} />
          </div>
          <div className="lg:col-span-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-3 py-2 font-medium">Ligne</th>
                  <th className="px-3 py-2 font-medium">Projet</th>
                  <th className="px-3 py-2 font-medium text-right">Alloué</th>
                  <th className="px-3 py-2 font-medium text-right">Utilisé</th>
                  <th className="px-3 py-2 font-medium text-right">Reste</th>
                </tr>
              </thead>
              <tbody>
                {budgetRows.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-ink-50 last:border-none"
                  >
                    <td className="px-3 py-2">
                      <div className="font-mono text-[11px] text-ink-500">
                        {b.code}
                      </div>
                      <div className="text-ink-800">{b.label}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-ink-500">
                      {b.project.projectCode}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(b.allocatedBudget, b.currency)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(b.used, b.currency)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${
                        b.allocatedBudget - b.used < 0
                          ? "font-medium text-red-600"
                          : "text-ink-700"
                      }`}
                    >
                      {formatCurrency(
                        b.allocatedBudget - b.used,
                        b.currency,
                      )}
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

function Row({
  label,
  value,
  ratio,
  tone = "default",
}: {
  label: string;
  value: string;
  ratio: number;
  tone?: "default" | "alt";
}) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-ink-700">{label}</span>
        <span className="font-medium text-ink-900">{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={
            tone === "alt" ? "h-full bg-purple-400" : "h-full bg-wwf-500"
          }
          style={{ width: `${Math.max(2, Math.min(ratio * 100, 100))}%` }}
        />
      </div>
    </div>
  );
}
