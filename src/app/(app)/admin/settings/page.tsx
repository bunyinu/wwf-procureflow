import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { PermissionsMatrix } from "@/components/PermissionsMatrix";
import { updateSettingsAction } from "./actions";
import { PROCUREMENT_TYPE_LABEL } from "@/lib/enums";

export const dynamic = "force-dynamic";

const SETTINGS_LAYOUT: Array<{
  group: string;
  description: string;
  fields: Array<{
    id: string;
    label: string;
    type: "number" | "text";
    suffix?: string;
  }>;
}> = [
  {
    group: "Seuils d'approbation",
    description:
      "Au-delà de ces montants, des étapes supplémentaires sont déclenchées.",
    fields: [
      {
        id: "threshold.tier1.maxAmountUSD",
        label: "Plafond niveau 1 — Approbateur + Achats",
        type: "number",
        suffix: "USD",
      },
      {
        id: "threshold.tier2.maxAmountUSD",
        label: "Plafond niveau 2 — Approbateur + Achats + seuil renforcé",
        type: "number",
        suffix: "USD",
      },
    ],
  },
  {
    group: "SLA workflow",
    description:
      "Délai indicatif par étape pour identifier les approbations en retard.",
    fields: [
      { id: "sla.managerReviewDays", label: "Revue hiérarchique", type: "number", suffix: "j" },
      {
        id: "sla.procurementReviewDays",
        label: "Revue Achats",
        type: "number",
        suffix: "j",
      },
      { id: "sla.financeReviewDays", label: "Revue seuil renforcé", type: "number", suffix: "j" },
    ],
  },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const user = await requireRole("ADMIN");
  // Admin workspace only. Persist is still guarded in the server action.
  const all = await prisma.setting.findMany();
  const map = new Map(all.map((s) => [s.id, s.value]));
  const enabled = (map.get("procurementTypes.enabled") || "")
    .split(",")
    .filter(Boolean);
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-wwf-700">
          Configuration
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Paramètres
        </h1>
        <p className="text-sm text-ink-500">
          Configuration des seuils, des SLA et de la matrice des droits. Toute
          modification est consignée au journal d&apos;audit.
        </p>
      </div>

      {searchParams.saved ? (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Paramètres enregistrés.
        </div>
      ) : null}

      <form action={updateSettingsAction} className="space-y-5">
        {SETTINGS_LAYOUT.map((g) => (
          <Card key={g.group}>
            <CardHeader title={g.group} description={g.description} />
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.id}>
                  <label className="text-xs font-medium text-ink-700">
                    {f.label}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      name={`setting:${f.id}`}
                      type={f.type}
                      defaultValue={map.get(f.id) ?? ""}
                      disabled={!isAdmin}
                      className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm disabled:bg-ink-50 disabled:text-ink-500"
                    />
                    {f.suffix ? (
                      <span className="text-xs text-ink-500">{f.suffix}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        ))}

        <Card>
          <CardHeader
            title="Procédures d'achat actives"
            description="Procédures disponibles dans les formulaires de réquisition."
          />
          <CardBody>
            <div className="flex flex-wrap gap-3">
              {Object.entries(PROCUREMENT_TYPE_LABEL).map(([k, v]) => (
                <label
                  key={k}
                  className="inline-flex items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs"
                >
                  <input
                    type="checkbox"
                    name="procType"
                    value={k}
                    defaultChecked={enabled.includes(k)}
                    disabled
                    className="h-4 w-4 rounded border-ink-300 text-wwf-600"
                  />
                  {v}
                </label>
              ))}
            </div>
            <input
              type="hidden"
              name="setting:procurementTypes.enabled"
              defaultValue={enabled.join(",")}
            />
            <p className="mt-3 text-[11px] text-ink-500">
              Le toggle dynamique des procédures sera activé en production.
              Cet aperçu reflète la liste actuelle.
            </p>
          </CardBody>
        </Card>

        {isAdmin ? (
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-800"
            >
              Enregistrer les paramètres
            </button>
          </div>
        ) : (
          <p className="text-right text-xs text-ink-500">
            Lecture seule — seul l&apos;administrateur peut enregistrer.
          </p>
        )}
      </form>

      <Card>
        <CardHeader
          title="Matrice des droits"
          description="Source unique de vérité — utilisée à la fois côté serveur (server actions) et côté UI."
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-wwf-50 px-2.5 py-0.5 text-[11px] font-medium text-wwf-700 ring-1 ring-wwf-100">
              <ShieldCheck className="h-3 w-3" />
              Séparation des fonctions
            </span>
          }
        />
        <CardBody className="space-y-3">
          <div className="grid gap-2 text-xs text-ink-600 sm:grid-cols-3">
            <div className="rounded-md border border-ink-100 bg-ink-50/40 px-3 py-2">
              <div className="font-medium text-ink-800">Append-only</div>
              Les approbations, réceptions et le journal d&apos;audit ne
              peuvent jamais être modifiés ni supprimés — y compris par
              l&apos;administrateur.
            </div>
            <div className="rounded-md border border-ink-100 bg-ink-50/40 px-3 py-2">
              <div className="font-medium text-ink-800">Séparation stricte</div>
              L&apos;administrateur configure les droits, seuils et référentiels,
              mais ne prend pas de décisions métier dans le workflow.
            </div>
            <div className="rounded-md border border-ink-100 bg-ink-50/40 px-3 py-2">
              <div className="font-medium text-ink-800">
                Désactivation, pas suppression
              </div>
              Les comptes utilisateurs et données de référence sont
              désactivés et conservés afin que les références historiques
              restent résolvables.
            </div>
          </div>
          <PermissionsMatrix />
          <p className="text-[11px] text-ink-500">
            Lecture seule. La matrice est définie dans{" "}
            <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10.5px]">
              src/lib/permissions.ts
            </code>{" "}
            et invoquée par chaque server action via{" "}
            <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10.5px]">
              assertCan(...)
            </code>
            .
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
