import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { createProjectAction, updateProjectAction } from "./actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function dateInput(d: Date | null | undefined) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const me = await requireRole("ADMIN");
  assertCan(me, "update", "project", {}, "/workspaces/admin?denied=1");
  const projects = await prisma.project.findMany({
    include: { _count: { select: { budgetLines: true, requisitions: true } } },
    orderBy: { name: "asc" },
  });

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
          Projets
        </h1>
        <p className="text-sm text-ink-500">
          Référentiel projets : code, bailleur, période d&apos;exécution. Les
          lignes budgétaires sont rattachées à un projet.
        </p>
      </div>

      {searchParams.error ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader
                title={p.name}
                description={
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink-500">
                      {p.projectCode}
                    </span>
                    {p.active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        Actif
                      </Badge>
                    ) : (
                      <Badge className="bg-ink-100 text-ink-600 ring-1 ring-ink-200">
                        Inactif
                      </Badge>
                    )}
                    <span className="text-[11px] text-ink-500">
                      {p._count.budgetLines} lignes ·{" "}
                      {p._count.requisitions} dossiers
                    </span>
                  </span>
                }
              />
              <CardBody>
                <form
                  action={updateProjectAction}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Nom
                    </label>
                    <input
                      name="name"
                      defaultValue={p.name}
                      required
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Code
                    </label>
                    <input
                      name="projectCode"
                      defaultValue={p.projectCode}
                      required
                      maxLength={40}
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm font-mono uppercase shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Bailleur
                    </label>
                    <input
                      name="donor"
                      defaultValue={p.donor ?? ""}
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <label className="mt-6 flex items-center gap-2 text-xs text-ink-700">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={p.active}
                      className="h-4 w-4 rounded border-ink-300 text-wwf-600"
                    />
                    Projet actif
                  </label>
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Date de début
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={dateInput(p.startDate)}
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={dateInput(p.endDate)}
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <span className="text-[11px] text-ink-500">
                      Période actuelle :{" "}
                      {p.startDate ? formatDate(p.startDate) : "—"} →{" "}
                      {p.endDate ? formatDate(p.endDate) : "—"}
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
          ))}
        </div>

        <Card>
          <CardHeader title="Créer un projet" />
          <CardBody>
            <form action={createProjectAction} className="space-y-3 text-sm">
              <input
                name="name"
                required
                placeholder="Nom du projet"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              />
              <input
                name="projectCode"
                required
                maxLength={40}
                placeholder="Code (MAJUSCULES)"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 font-mono uppercase shadow-sm"
              />
              <input
                name="donor"
                placeholder="Bailleur (optionnel)"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-ink-500">Début</label>
                  <input
                    type="date"
                    name="startDate"
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-500">Fin</label>
                  <input
                    type="date"
                    name="endDate"
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                  className="h-4 w-4 rounded border-ink-300 text-wwf-600"
                />
                Projet actif dès la création
              </label>
              <button
                type="submit"
                className="w-full rounded-md bg-wwf-700 px-3 py-2 text-sm font-medium text-white hover:bg-wwf-800"
              >
                Créer le projet
              </button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
