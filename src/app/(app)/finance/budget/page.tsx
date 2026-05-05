import Link from "next/link";
import {
  AlertTriangle,
  CircleDollarSign,
  Download,
  PiggyBank,
  Printer,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Stat } from "@/components/Stat";
import { Badge } from "@/components/Badge";
import { BudgetBars } from "@/components/charts/BudgetBars";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FinanceBudgetPage() {
  await requireRole("REPORTING");
  const [budgetLines, requisitions] = await Promise.all([
    prisma.budgetLine.findMany({
      include: { project: true },
      orderBy: { code: "asc" },
    }),
    prisma.purchaseRequisition.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { budgetLine: true },
    }),
  ]);

  const totalAllocated = budgetLines.reduce((s, b) => s + b.allocatedBudget, 0);
  const totalUsed = budgetLines.reduce(
    (s, b) => s + b.spentAmount + b.committedAmount,
    0,
  );
  const totalSpent = budgetLines.reduce((s, b) => s + b.spentAmount, 0);
  const totalCommitted = budgetLines.reduce((s, b) => s + b.committedAmount, 0);
  const overSpent = budgetLines.filter(
    (b) => b.spentAmount + b.committedAmount > b.allocatedBudget,
  );
  const exceptions = requisitions.filter((r) => {
    const remaining =
      r.budgetLine.allocatedBudget -
      r.budgetLine.committedAmount -
      r.budgetLine.spentAmount;
    return r.amount > remaining;
  });
  const consumption = budgetLines.map((b) => ({
    code: b.code,
    pct: ((b.spentAmount + b.committedAmount) / b.allocatedBudget) * 100,
  }));

  // Per-project rollup
  const byProject = new Map<
    string,
    { name: string; allocated: number; used: number }
  >();
  for (const b of budgetLines) {
    const key = b.project.projectCode;
    const cur = byProject.get(key) || {
      name: b.project.name,
      allocated: 0,
      used: 0,
    };
    cur.allocated += b.allocatedBudget;
    cur.used += b.spentAmount + b.committedAmount;
    byProject.set(key, cur);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-700">
            Espace Finance
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
            Ledger budgétaire
          </h1>
          <p className="text-sm text-ink-500">
            Engagements, dépenses et soldes consolidés. Tout dépassement est
            mis en évidence pour réallocation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/print/budget"
            target="_blank"
            className="lift inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-soft hover:border-wwf-300"
          >
            <Printer className="h-3.5 w-3.5" />
            Édition PDF officielle
          </Link>
          <a
            href="/api/export/budget"
            className="lift inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-soft hover:border-wwf-300"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Budget alloué"
          value={formatCurrency(totalAllocated)}
          hint={`${budgetLines.length} lignes`}
          icon={PiggyBank}
          tone="brand"
        />
        <Stat
          label="Engagé + dépensé"
          value={formatCurrency(totalUsed)}
          hint={`${((totalUsed / totalAllocated) * 100).toFixed(0)} % consommé`}
          icon={CircleDollarSign}
          tone={totalUsed / totalAllocated > 0.85 ? "warn" : "good"}
        />
        <Stat
          label="Solde disponible"
          value={formatCurrency(totalAllocated - totalUsed)}
          hint="Capacité d'engagement restante"
          icon={TrendingUp}
        />
        <Stat
          label="Exceptions"
          value={exceptions.length}
          hint={`${overSpent.length} ligne(s) en dépassement`}
          icon={AlertTriangle}
          tone={exceptions.length > 0 ? "warn" : "muted"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Consommation par ligne budgétaire"
            description="Vert ≤ 80 % · Ambre ≤ 100 % · Rouge > 100 %"
          />
          <CardBody>
            <BudgetBars data={consumption} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Synthèse par projet" />
          <CardBody className="space-y-2 text-sm">
            {Array.from(byProject.entries()).map(([code, p]) => {
              const pct = (p.used / p.allocated) * 100;
              return (
                <div
                  key={code}
                  className="rounded-md border border-ink-100 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[11px] text-ink-500">
                      {code}
                    </div>
                    <Badge
                      className={
                        pct > 100
                          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                          : pct > 80
                            ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      }
                    >
                      {pct.toFixed(0)} %
                    </Badge>
                  </div>
                  <div className="mt-1 truncate text-ink-800">{p.name}</div>
                  <div className="mt-1 text-[11px] text-ink-500">
                    {formatCurrency(p.used)} / {formatCurrency(p.allocated)}
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Détail par ligne"
          description="Vue analytique pour validation des engagements"
        />
        <CardBody className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-2.5 font-medium">Ligne</th>
                  <th className="px-5 py-2.5 font-medium">Projet</th>
                  <th className="px-5 py-2.5 font-medium text-right">
                    Alloué
                  </th>
                  <th className="px-5 py-2.5 font-medium text-right">
                    Engagé
                  </th>
                  <th className="px-5 py-2.5 font-medium text-right">
                    Dépensé
                  </th>
                  <th className="px-5 py-2.5 font-medium text-right">Reste</th>
                  <th className="px-5 py-2.5 font-medium">Consommation</th>
                </tr>
              </thead>
              <tbody>
                {budgetLines.map((b) => {
                  const used = b.spentAmount + b.committedAmount;
                  const pct = (used / b.allocatedBudget) * 100;
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-ink-50 last:border-none"
                    >
                      <td className="px-5 py-2.5">
                        <div className="font-mono text-[11px] text-ink-500">
                          {b.code}
                        </div>
                        <div className="text-ink-800">{b.label}</div>
                      </td>
                      <td className="px-5 py-2.5 text-ink-700">
                        {b.project.projectCode}
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono">
                        {formatCurrency(b.allocatedBudget, b.currency)}
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono">
                        {formatCurrency(b.committedAmount, b.currency)}
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono">
                        {formatCurrency(b.spentAmount, b.currency)}
                      </td>
                      <td
                        className={`px-5 py-2.5 text-right font-mono ${
                          b.allocatedBudget - used < 0
                            ? "font-semibold text-rose-600"
                            : "text-ink-700"
                        }`}
                      >
                        {formatCurrency(b.allocatedBudget - used, b.currency)}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink-100">
                            <div
                              className={`h-full ${
                                pct > 100
                                  ? "bg-rose-500"
                                  : pct > 80
                                    ? "bg-amber-500"
                                    : "bg-wwf-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-ink-600">
                            {pct.toFixed(0)} %
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {exceptions.length > 0 ? (
        <Card>
          <CardHeader
            title="Exceptions budgétaires"
            description="Réquisitions dont le montant excède le solde disponible"
            action={
              <Badge className="bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                {exceptions.length} dossier(s)
              </Badge>
            }
          />
          <CardBody className="space-y-2">
            {exceptions.map((r) => (
              <Link
                key={r.id}
                href={`/requisitions/${r.id}`}
                className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/40 px-3 py-2 text-sm hover:bg-amber-50"
              >
                <div>
                  <div className="font-medium text-ink-800">
                    {r.budgetLine.code} — {r.budgetLine.label}
                  </div>
                  <div className="text-xs text-ink-600">
                    Demande de {formatCurrency(r.amount, r.currency)} ·
                    réquisition à examiner
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800">
                  Examiner →
                </Badge>
              </Link>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
