import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  DUE_DILIGENCE_BADGE,
  DUE_DILIGENCE_LABEL,
  SUPPLIER_STATUS_BADGE,
  SUPPLIER_STATUS_LABEL,
  PO_STATUS_BADGE,
  PO_STATUS_LABEL,
  type DueDiligenceStatus,
  type SupplierStatus,
  type POStatus,
} from "@/lib/enums";
import { ShieldCheck } from "lucide-react";
import {
  toggleAntiCorruptionAction,
  updateSupplierStatusAction,
} from "../actions";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const checklistItems = [
  "Vérification administrative (RCCM, NIF, statuts)",
  "Vérification fiscale (attestation à jour)",
  "Vérification anti-corruption (sanctions, PEP)",
  "Vérification capacité financière",
  "Visite des locaux ou références client",
];

export default async function SupplierDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole("SUPPLIER_MANAGER");
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: {
      purchaseOrders: {
        include: { requisition: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!supplier) notFound();
  const canEdit = user.role === "SUPPLIER_MANAGER";

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/suppliers"
          className="text-xs font-medium text-ink-500 hover:text-wwf-700"
        >
          ← Retour aux fournisseurs
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          {supplier.companyName}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <Badge
            className={
              SUPPLIER_STATUS_BADGE[supplier.status as SupplierStatus] ?? ""
            }
          >
            {SUPPLIER_STATUS_LABEL[supplier.status as SupplierStatus] ??
              supplier.status}
          </Badge>
          <Badge
            className={
              DUE_DILIGENCE_BADGE[
                supplier.dueDiligenceStatus as DueDiligenceStatus
              ] ?? ""
            }
          >
            Diligence :{" "}
            {DUE_DILIGENCE_LABEL[
              supplier.dueDiligenceStatus as DueDiligenceStatus
            ] ?? supplier.dueDiligenceStatus}
          </Badge>
          <span className="text-xs text-ink-500">Score {supplier.score}/100</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader title="Profil entreprise" />
            <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
              <Field label="Identifiant fiscal" value={supplier.taxId ?? "—"} />
              <Field label="Contact" value={supplier.contactName ?? "—"} />
              <Field label="E-mail" value={supplier.email ?? "—"} />
              <Field label="Téléphone" value={supplier.phone ?? "—"} />
              <div className="sm:col-span-2">
                <Field label="Adresse" value={supplier.address ?? "—"} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Attestation Annexe B — Lettre de certification & engagement"
              description="Conformité TDR : engagement anti-corruption et trafic d'influence"
              action={
                supplier.antiCorruptionSignedAt ? (
                  <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    Signée le{" "}
                    {formatDate(supplier.antiCorruptionSignedAt)}
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                    Non signée
                  </Badge>
                )
              }
            />
            <CardBody className="space-y-3 text-sm text-ink-700">
              <p>
                Le fournisseur s&apos;engage, conformément à l&apos;Annexe B,
                à ne recourir à aucun acte de corruption ni de trafic
                d&apos;influence. Toute violation entraîne radiation
                immédiate de la liste des fournisseurs préqualifiés.
              </p>
              {canEdit ? (
                <form action={toggleAntiCorruptionAction}>
                  <input type="hidden" name="id" value={supplier.id} />
                  <button
                    type="submit"
                    className={
                      supplier.antiCorruptionSignedAt
                        ? "rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                        : "rounded-md bg-wwf-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-wwf-800"
                    }
                  >
                    {supplier.antiCorruptionSignedAt
                      ? "Révoquer l'attestation"
                      : "Enregistrer la signature de l'Annexe B"}
                  </button>
                </form>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Checklist diligence raisonnable" />
            <CardBody>
              <ul className="space-y-2 text-sm">
                {checklistItems.map((c, i) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 rounded-md border border-ink-100 px-3 py-2"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        supplier.dueDiligenceStatus === "CLEARED"
                          ? "bg-emerald-100 text-emerald-700"
                          : supplier.dueDiligenceStatus === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-ink-800">{c}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Bons de commande liés" />
            <CardBody className="px-0 py-0">
              {supplier.purchaseOrders.length === 0 ? (
                <p className="px-5 py-6 text-sm text-ink-500">
                  Aucun PO associé à ce fournisseur.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                      <th className="px-5 py-2.5 font-medium">PO</th>
                      <th className="px-5 py-2.5 font-medium">Réquisition</th>
                      <th className="px-5 py-2.5 font-medium">Montant</th>
                      <th className="px-5 py-2.5 font-medium">Statut</th>
                      <th className="px-5 py-2.5 font-medium">Émis le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.purchaseOrders.map((po) => (
                      <tr key={po.id} className="border-b border-ink-50">
                        <td className="px-5 py-2.5 font-mono text-xs text-ink-500">
                          {po.poNumber}
                        </td>
                        <td className="px-5 py-2.5">
                          <Link
                            href={`/requisitions/${po.requisitionId}`}
                            className="text-ink-800 hover:text-wwf-700"
                          >
                            {po.requisition.title}
                          </Link>
                        </td>
                        <td className="px-5 py-2.5 font-medium text-ink-900">
                          {formatCurrency(po.amount, po.currency)}
                        </td>
                        <td className="px-5 py-2.5">
                          <Badge
                            className={
                              PO_STATUS_BADGE[po.status as POStatus] ?? ""
                            }
                          >
                            {PO_STATUS_LABEL[po.status as POStatus] ??
                              po.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-2.5 text-xs text-ink-500">
                          {formatDate(po.issuedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Gestion du statut" />
          <CardBody>
            {canEdit ? (
              <form action={updateSupplierStatusAction} className="space-y-3">
                <input type="hidden" name="id" value={supplier.id} />
                <div>
                  <label className="text-xs font-medium text-ink-700">
                    Statut
                  </label>
                  <select
                    name="status"
                    defaultValue={supplier.status}
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    {Object.entries(SUPPLIER_STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-700">
                    Diligence raisonnable
                  </label>
                  <select
                    name="dueDiligenceStatus"
                    defaultValue={supplier.dueDiligenceStatus}
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    {Object.entries(DUE_DILIGENCE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-wwf-600 px-3 py-2 text-sm font-medium text-white hover:bg-wwf-700"
                >
                  Enregistrer
                </button>
              </form>
            ) : (
              <p className="text-xs text-ink-500">
                Seul le Gestionnaire Fournisseurs peut modifier le
                statut.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-ink-800">{value}</div>
    </div>
  );
}
