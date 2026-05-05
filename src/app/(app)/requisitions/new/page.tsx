import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { createRequisitionAction } from "../actions";
import { PRIORITY_LABEL } from "@/lib/enums";
import { AttachmentsZone } from "@/components/AttachmentsZone";

export const dynamic = "force-dynamic";

export default async function NewRequisitionPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await requireUser();
  const errorMessage = searchParams.error
    ? decodeURIComponent(searchParams.error)
    : null;
  if (user.role !== "REQUESTER") {
    redirect("/requisitions?denied=1");
  }
  const [departments, projects, budgetLines] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.budgetLine.findMany({
      include: { project: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Nouvelle réquisition
        </h1>
        <p className="text-sm text-ink-500">
          Renseignez les informations ci-dessous. Vous pouvez sauvegarder en
          brouillon ou soumettre directement à la validation managériale.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          Vérifiez la saisie : {errorMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader title="Informations dossier" />
        <CardBody>
          <form action={createRequisitionAction} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-700">
                Objet de la demande
              </label>
              <input
                name="title"
                required
                placeholder="Ex. Achat ordinateurs portables pour équipe terrain"
                className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-wwf-500 focus:ring-2 focus:ring-wwf-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-700">
                Description
              </label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Décrivez précisément les biens ou services demandés."
                className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-wwf-500 focus:ring-2 focus:ring-wwf-200"
              />
            </div>

            <div className="rounded-md border border-sky-100 bg-sky-50/60 px-3 py-2 text-xs text-sky-800">
              Le numéro de réquisition est généré automatiquement côté serveur au format PR-AAAA-NNNN. Le Demandeur ne choisit ni fournisseur, ni méthode d&apos;achat, ni analyse d&apos;offres.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Département
                </label>
                <select
                  name="departmentId"
                  required
                  defaultValue={user.departmentId ?? ""}
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Projet
                </label>
                <select
                  name="projectId"
                  required
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-700">
                Ligne budgétaire
              </label>
              <select
                name="budgetLineId"
                required
                className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                {budgetLines.map((b) => {
                  const remaining =
                    b.allocatedBudget - b.committedAmount - b.spentAmount;
                  return (
                    <option key={b.id} value={b.id}>
                      {b.code} — {b.label} ({b.project.projectCode}) · reste {remaining.toLocaleString("fr-FR")} {b.currency}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Quantité
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={1}
                  required
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Unité de mesure
                </label>
                <select
                  name="unit"
                  defaultValue="unité"
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  {[
                    "unité",
                    "lot",
                    "kit",
                    "exemplaire",
                    "jour",
                    "mois",
                    "trimestre",
                    "participant",
                    "litre",
                    "kg",
                    "mètre",
                    "mission",
                  ].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Montant total
                </label>
                <input
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Devise
                </label>
                <select
                  name="currency"
                  defaultValue="USD"
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>CDF</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Priorité
                </label>
                <select
                  name="priority"
                  defaultValue="NORMAL"
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-700">
                Justification
              </label>
              <textarea
                name="justification"
                required
                rows={4}
                placeholder="Expliquez le besoin opérationnel, l'urgence, l'impact attendu…"
                className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
              />
            </div>

            <AttachmentsZone hint="Catégories prévues : devis, contrat, facture, justification, pièce d'identité." />

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                name="intent"
                value="draft"
                className="rounded-md border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-ink-50"
              >
                Enregistrer en brouillon
              </button>
              <button
                type="submit"
                name="intent"
                value="submit"
                className="rounded-md bg-wwf-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-wwf-700"
              >
                Soumettre pour validation
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
