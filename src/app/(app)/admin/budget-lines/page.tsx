import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  createBudgetLineAction,
  updateBudgetLineAction,
} from "../projects/actions";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminBudgetLinesPage({
  searchParams,
}: {
  searchParams: { error?: string; project?: string };
}) {
  const me = await requireUser();
  assertCan(me, "update", "budgetLine", {}, "/dashboard?denied=1");
  const [budgetLines, projects] = await Promise.all([
    prisma.budgetLine.findMany({
      include: { project: true, _count: { select: { requisitions: true } } },
      where: searchParams.project ? { projectId: searchParams.project } : {},
      orderBy: [{ projectId: "asc" }, { code: "asc" }],
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-wwf-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la console
        </Link>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-700">
          Console administrateur
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
          Lignes budgétaires
        </h1>
        <p className="text-sm text-ink-500">
          Référentiel des lignes budgétaires rattachées aux projets. Les
          réquisitions consomment ces lignes.
        </p>
      </div>

      {searchParams.error ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <Card>
        <CardBody>
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-medium text-ink-700">
                Filtrer par projet
              </label>
              <select
                name="project"
                defaultValue={searchParams.project ?? ""}
                className="mt-1 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs"
              >
                <option value="">Tous les projets</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectCode} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              Appliquer
            </button>
            <Link
              href="/admin/budget-lines"
              className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
            >
              Réinitialiser
            </Link>
          </form>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {budgetLines.map((b) => {
            const used = b.spentAmount + b.committedAmount;
            const pct = (used / b.allocatedBudget) * 100;
            return (
              <Card key={b.id}>
                <CardHeader
                  title={b.label}
                  description={
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-500">
                        {b.code}
                      </span>
                      <Badge className="bg-ink-100 text-ink-700">
                        {b.project.projectCode}
                      </Badge>
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
                      <span className="text-[11px] text-ink-500">
                        {b._count.requisitions} dossier(s)
                      </span>
                    </span>
                  }
                />
                <CardBody>
                  <form
                    action={updateBudgetLineAction}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <input type="hidden" name="id" value={b.id} />
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-ink-700">
                        Libellé
                      </label>
                      <input
                        name="label"
                        defaultValue={b.label}
                        required
                        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">
                        Code
                      </label>
                      <input
                        name="code"
                        defaultValue={b.code}
                        required
                        maxLength={40}
                        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm font-mono uppercase shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">
                        Projet
                      </label>
                      <select
                        name="projectId"
                        defaultValue={b.projectId}
                        required
                        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.projectCode} — {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">
                        Budget alloué
                      </label>
                      <input
                        type="number"
                        name="allocatedBudget"
                        min="0"
                        step="0.01"
                        defaultValue={b.allocatedBudget}
                        required
                        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">
                        Devise
                      </label>
                      <select
                        name="currency"
                        defaultValue={b.currency}
                        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>CDF</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-ink-700">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={b.active}
                        className="h-4 w-4 rounded border-ink-300 text-wwf-600"
                      />
                      Ligne active
                    </label>
                    <div className="sm:col-span-2 flex items-center justify-between border-t border-ink-100 pt-2">
                      <span className="text-[11px] text-ink-500">
                        Utilisé : {formatCurrency(used, b.currency)} /{" "}
                        {formatCurrency(b.allocatedBudget, b.currency)} (
                        {formatCurrency(
                          b.allocatedBudget - used,
                          b.currency,
                        )}{" "}
                        restant)
                      </span>
                      <button
                        type="submit"
                        className="rounded-md bg-wwf-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-wwf-800"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader title="Créer une ligne budgétaire" />
          <CardBody>
            <form
              action={createBudgetLineAction}
              className="space-y-3 text-sm"
            >
              <select
                name="projectId"
                required
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              >
                <option value="">— Choisir un projet —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectCode} — {p.name}
                  </option>
                ))}
              </select>
              <input
                name="code"
                required
                maxLength={40}
                placeholder="Code (BL-XXX)"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 font-mono uppercase shadow-sm"
              />
              <input
                name="label"
                required
                placeholder="Libellé"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="allocatedBudget"
                  min="0"
                  step="0.01"
                  required
                  placeholder="Montant alloué"
                  className="rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <select
                  name="currency"
                  defaultValue="USD"
                  className="rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>CDF</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                  className="h-4 w-4 rounded border-ink-300 text-wwf-600"
                />
                Active dès la création
              </label>
              <button
                type="submit"
                className="w-full rounded-md bg-wwf-700 px-3 py-2 text-sm font-medium text-white hover:bg-wwf-800"
              >
                Créer la ligne
              </button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
