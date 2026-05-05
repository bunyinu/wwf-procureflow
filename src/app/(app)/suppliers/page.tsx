import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ShieldCheck } from "lucide-react";
import {
  DUE_DILIGENCE_BADGE,
  DUE_DILIGENCE_LABEL,
  SUPPLIER_STATUS_BADGE,
  SUPPLIER_STATUS_LABEL,
  type DueDiligenceStatus,
  type SupplierStatus,
} from "@/lib/enums";
import { createSupplierAction } from "./actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const user = await requireUser();
  const suppliers = await prisma.supplier.findMany({
    orderBy: { companyName: "asc" },
  });
  const canCreate = ["PROCUREMENT", "ADMIN"].includes(user.role);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Fournisseurs
        </h1>
        <p className="text-sm text-ink-500">
          Registre des fournisseurs et statut de diligence raisonnable.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="px-0 py-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">Société</th>
                    <th className="px-5 py-2.5 font-medium">Statut</th>
                    <th className="px-5 py-2.5 font-medium">Diligence</th>
                    <th className="px-5 py-2.5 font-medium">Annexe B</th>
                    <th className="px-5 py-2.5 font-medium">Score</th>
                    <th className="px-5 py-2.5 font-medium">Ajouté</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-ink-50 transition hover:bg-ink-50/60"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/suppliers/${s.id}`}
                          className="font-medium text-ink-900 hover:text-wwf-700"
                        >
                          {s.companyName}
                        </Link>
                        <div className="text-xs text-ink-500">
                          {s.contactName ?? "—"} · {s.email ?? "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={
                            SUPPLIER_STATUS_BADGE[s.status as SupplierStatus] ??
                            ""
                          }
                        >
                          {SUPPLIER_STATUS_LABEL[s.status as SupplierStatus] ??
                            s.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={
                            DUE_DILIGENCE_BADGE[
                              s.dueDiligenceStatus as DueDiligenceStatus
                            ] ?? ""
                          }
                        >
                          {DUE_DILIGENCE_LABEL[
                            s.dueDiligenceStatus as DueDiligenceStatus
                          ] ?? s.dueDiligenceStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        {s.antiCorruptionSignedAt ? (
                          <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            <ShieldCheck className="h-3 w-3" />
                            Signée
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                            En attente
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-ink-800">
                        {s.score}/100
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-500">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Ajouter un fournisseur" />
          <CardBody>
            {canCreate ? (
              <form action={createSupplierAction} className="space-y-3 text-sm">
                <input
                  name="companyName"
                  required
                  placeholder="Raison sociale"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <input
                  name="taxId"
                  placeholder="Identifiant fiscal"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <input
                  name="contactName"
                  placeholder="Personne de contact"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Adresse e-mail"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <input
                  name="phone"
                  placeholder="Téléphone"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <input
                  name="address"
                  placeholder="Adresse"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="status"
                    defaultValue="PENDING"
                    className="rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                  >
                    {Object.entries(SUPPLIER_STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <select
                    name="dueDiligenceStatus"
                    defaultValue="NOT_STARTED"
                    className="rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                  >
                    {Object.entries(DUE_DILIGENCE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-ink-500">
                    Score (0–100)
                  </label>
                  <input
                    name="score"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={50}
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-wwf-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-700"
                >
                  Enregistrer le fournisseur
                </button>
              </form>
            ) : (
              <p className="text-xs text-ink-500">
                La création de fournisseurs est réservée aux rôles Achats et
                Administrateur.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
