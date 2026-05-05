import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import {
  PO_STATUS_BADGE,
  PO_STATUS_LABEL,
  type POStatus,
} from "@/lib/enums";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersPage() {
  const user = await requireRole("PROCUREMENT", "SUPPLIER_MANAGER", "RECEIVER");
  const orders = await prisma.purchaseOrder.findMany({
    include: { supplier: true, requisition: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Bons de commande
        </h1>
        <p className="text-sm text-ink-500">
          Suivi de l&apos;émission, de la réception et de la clôture des
          engagements.
        </p>
      </div>

      <Card>
        <CardBody className="px-0 py-0">
          {orders.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="Aucun bon de commande"
                description="Les PO apparaissent ici une fois la validation par seuil terminée."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">PO</th>
                    <th className="px-5 py-2.5 font-medium">Réquisition</th>
                    <th className="px-5 py-2.5 font-medium">Fournisseur</th>
                    <th className="px-5 py-2.5 font-medium">Montant</th>
                    <th className="px-5 py-2.5 font-medium">Statut</th>
                    <th className="px-5 py-2.5 font-medium">Émis</th>
                    <th className="px-5 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((po) => (
                    <tr
                      key={po.id}
                      className="border-b border-ink-50 transition hover:bg-ink-50/60"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-ink-500">
                        {po.poNumber}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/requisitions/${po.requisitionId}`}
                          className="font-medium text-ink-900 hover:text-wwf-700"
                        >
                          {po.requisition.title}
                        </Link>
                        <div className="text-xs text-ink-500">
                          {po.requisition.requisitionNumber}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {user.role === "SUPPLIER_MANAGER" ? (
                          <Link
                            href={`/suppliers/${po.supplierId}`}
                            className="hover:text-wwf-700"
                          >
                            {po.supplier.companyName}
                          </Link>
                        ) : (
                          po.supplier.companyName
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-ink-900">
                        {formatCurrency(po.amount, po.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={
                            PO_STATUS_BADGE[po.status as POStatus] ?? ""
                          }
                        >
                          {PO_STATUS_LABEL[po.status as POStatus] ?? po.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-500">
                        {formatDate(po.issuedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/print/po/${po.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-ink-50"
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
  );
}
