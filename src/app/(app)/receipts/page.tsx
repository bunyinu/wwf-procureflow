import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import {
  RECEIPT_TYPE_LABEL,
  type ReceiptType,
  type POStatus,
  PO_STATUS_LABEL,
} from "@/lib/enums";
import { createReceiptAction } from "../requisitions/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { AttachmentsZone } from "@/components/AttachmentsZone";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const user = await requireRole("RECEIVER");
  const [receipts, openPOs] = await Promise.all([
    prisma.goodsReceipt.findMany({
      include: {
        receivedBy: true,
        requisition: true,
        purchaseOrder: { include: { supplier: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { status: "ISSUED" },
      include: { supplier: true, requisition: true },
      orderBy: { issuedAt: "asc" },
    }),
  ]);
  const canRecord = user.role === "RECEIVER";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Réceptions
        </h1>
        <p className="text-sm text-ink-500">
          Acceptation des biens (GRN) et services (SAN) avec traçabilité des
          écarts.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="px-0 py-0">
              {receipts.length === 0 ? (
                <div className="px-5 py-10">
                  <EmptyState
                    title="Aucune réception enregistrée"
                    description="Les réceptions apparaissent dès qu'un PO est marqué comme reçu."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                        <th className="px-5 py-2.5 font-medium">PO</th>
                        <th className="px-5 py-2.5 font-medium">Type</th>
                        <th className="px-5 py-2.5 font-medium">Fournisseur</th>
                        <th className="px-5 py-2.5 font-medium">Reçu par</th>
                        <th className="px-5 py-2.5 font-medium">Date</th>
                        <th className="px-5 py-2.5 font-medium">Écart</th>
                        <th className="px-5 py-2.5 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-ink-50 transition hover:bg-ink-50/60"
                        >
                          <td className="px-5 py-3 font-mono text-xs text-ink-500">
                            {r.purchaseOrder.poNumber}
                          </td>
                          <td className="px-5 py-3">
                            <Badge className="bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                              {
                                RECEIPT_TYPE_LABEL[
                                  r.receiptType as ReceiptType
                                ]
                              }
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-ink-700">
                            {r.purchaseOrder.supplier.companyName}
                          </td>
                          <td className="px-5 py-3 text-ink-700">
                            {r.receivedBy.fullName}
                          </td>
                          <td className="px-5 py-3 text-xs text-ink-500">
                            {formatDate(r.receivedDate)}
                          </td>
                          <td className="px-5 py-3">
                            {r.discrepancyFlag ? (
                              <Badge className="bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                                Écart
                              </Badge>
                            ) : (
                              <span className="text-xs text-ink-500">
                                Conforme
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              href={`/print/receipt/${r.id}`}
                              target="_blank"
                              className="rounded-md border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-ink-50"
                            >
                              Imprimer
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Enregistrer une réception" />
          <CardBody>
            {!canRecord ? (
              <p className="text-xs text-ink-500">
                Seul le rôle Réceptionnaire peut enregistrer
                une réception.
              </p>
            ) : openPOs.length === 0 ? (
              <p className="text-xs text-ink-500">
                Aucun PO en cours. Tous les bons de commande émis ont été
                réceptionnés.
              </p>
            ) : (
              <form action={createReceiptAction} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-medium text-ink-700">
                    Bon de commande
                  </label>
                  <select
                    name="purchaseOrderId"
                    required
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                    defaultValue={openPOs[0].id}
                  >
                    {openPOs.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} — {po.supplier.companyName} (
                        {formatCurrency(po.amount, po.currency)})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-ink-500">
                  Le réquisitionId est dérivé côté serveur depuis le PO sélectionné pour éviter toute incohérence formulaire.
                </p>
                <div>
                  <label className="text-xs font-medium text-ink-700">
                    Type
                  </label>
                  <select
                    name="receiptType"
                    defaultValue="GRN"
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <option value="GRN">Bon de réception (GRN)</option>
                    <option value="SAN">Acceptation service (SAN)</option>
                  </select>
                </div>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Observations"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <label className="flex items-center gap-2 text-xs text-ink-700">
                  <input
                    type="checkbox"
                    name="discrepancyFlag"
                    className="h-4 w-4 rounded border-ink-300 text-wwf-600 focus:ring-wwf-500"
                  />
                  Signaler un écart
                </label>
                <textarea
                  name="discrepancyNotes"
                  rows={2}
                  placeholder="Description des écarts (le cas échéant)"
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
                <AttachmentsZone hint="Photos de livraison, bordereau signé, fiche de contrôle." />
                <button
                  type="submit"
                  className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Enregistrer la réception
                </button>
              </form>
            )}
            <div className="mt-4 border-t border-ink-100 pt-3 text-[11px] text-ink-500">
              {openPOs.length} PO en attente de réception · statut PO actuel :{" "}
              {openPOs[0]
                ? PO_STATUS_LABEL[openPOs[0].status as POStatus]
                : "—"}
              .
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
