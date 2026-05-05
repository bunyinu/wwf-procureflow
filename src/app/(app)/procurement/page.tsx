import Link from "next/link";
import {
  Award,
  ClipboardCheck,
  ClipboardList,
  PackageCheck,
  Tag,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Stat } from "@/components/Stat";
import { Badge } from "@/components/Badge";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { EmptyState } from "@/components/EmptyState";
import {
  PROCUREMENT_TYPE_LABEL,
  PO_STATUS_LABEL,
  PO_STATUS_BADGE,
  type POStatus,
  type ProcurementType,
} from "@/lib/enums";
import { formatCurrency, formatDate, relativeFromNow } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProcurementWorkspacePage() {
  const user = await requireUser();
  // Procurement Officer + Admin
  if (user.role !== "PROCUREMENT" && user.role !== "ADMIN") {
    assertCan(user, "issuePO", "purchaseOrder", {}, "/dashboard?denied=1");
  }

  const [classifyQueue, awardQueue, activeOrders, suppliers] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: { status: "PROCUREMENT_REVIEW" },
      include: {
        requester: true,
        project: true,
        budgetLine: true,
        quotes: { include: { supplier: true }, orderBy: { isWinner: "desc" } },
      },
      orderBy: [{ priority: "desc" }, { submittedAt: "asc" }],
    }),
    prisma.purchaseRequisition.findMany({
      where: { status: "PO_CREATED", purchaseOrders: { none: {} } },
      include: {
        requester: true,
        project: true,
        budgetLine: true,
      },
      orderBy: { updatedAt: "asc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ["ISSUED", "PARTIALLY_RECEIVED"] } },
      include: { supplier: true, requisition: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.supplier.findMany({
      where: { status: "PREQUALIFIED" },
      orderBy: { score: "desc" },
    }),
  ]);

  const totalAwardValue = activeOrders.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-purple-700">
          Espace Achats · Module §4.4
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
          Workspace Achats
        </h1>
        <p className="text-sm text-ink-500">
          Classification du mode d&apos;achat, analyse des offres,
          attribution des marchés, suivi des commandes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="À classifier"
          value={classifyQueue.length}
          icon={Tag}
          tone={classifyQueue.length > 0 ? "warn" : "good"}
          hint="Approuvés en attente de méthode"
        />
        <Stat
          label="Marchés à attribuer"
          value={awardQueue.length}
          icon={Award}
          tone={awardQueue.length > 0 ? "warn" : "good"}
          hint="Validés Finance, PO non émis"
        />
        <Stat
          label="Commandes actives"
          value={activeOrders.length}
          icon={ClipboardList}
          hint={formatCurrency(totalAwardValue)}
        />
        <Stat
          label="Fournisseurs préqualifiés"
          value={suppliers.length}
          icon={Truck}
          hint="Pool éligible à l'attribution"
        />
      </div>

      {/* Classification queue */}
      <Card>
        <CardHeader
          title="Étape 1 — Classification & analyse des offres"
          description="Choisir la méthode (Direct, Préqualifié, Cotations, Appel d'offres, Source unique) puis valider"
          action={
            <Badge className="bg-purple-50 text-purple-700 ring-1 ring-purple-100">
              {classifyQueue.length} dossier(s)
            </Badge>
          }
        />
        <CardBody className="px-0 py-0">
          {classifyQueue.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="Aucun dossier à classifier"
                description="Les dossiers approuvés apparaîtront ici dès la décision hiérarchique."
                icon={Tag}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">N°</th>
                    <th className="px-5 py-2.5 font-medium">Objet</th>
                    <th className="px-5 py-2.5 font-medium">Méthode</th>
                    <th className="px-5 py-2.5 font-medium">Offres</th>
                    <th className="px-5 py-2.5 font-medium text-right">Montant</th>
                    <th className="px-5 py-2.5 font-medium">Priorité</th>
                    <th className="px-5 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {classifyQueue.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-ink-50 hover:bg-ink-50/40"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-ink-500">
                        {r.requisitionNumber}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink-900">
                          {r.title}
                        </div>
                        <div className="text-[11px] text-ink-500">
                          {r.requester.fullName} · {r.project.projectCode} ·{" "}
                          {r.budgetLine.code}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-700">
                        <Badge className="bg-ink-100 text-ink-700">
                          {
                            PROCUREMENT_TYPE_LABEL[
                              r.procurementType as ProcurementType
                            ]
                          }
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {r.quotes.length > 0 ? (
                          <span className="text-ink-700">
                            {r.quotes.length} offre(s)
                            {r.quotes.find((q) => q.isWinner) ? (
                              <span className="ml-1 text-emerald-700">
                                · retenu
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-ink-400">à recueillir</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink-900">
                        {formatCurrency(r.amount, r.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/requisitions/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                        >
                          Traiter →
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

      {/* Award queue */}
      <Card>
        <CardHeader
          title="Étape 2 — Attribution du marché (PO)"
          description="Émettre le bon de commande au fournisseur retenu"
          action={
            <Badge className="bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
              {awardQueue.length} en attente
            </Badge>
          }
        />
        <CardBody className="px-0 py-0">
          {awardQueue.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="Aucune attribution en attente"
                description="Les dossiers validés Finance apparaîtront ici."
                icon={Award}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">N°</th>
                    <th className="px-5 py-2.5 font-medium">Objet</th>
                    <th className="px-5 py-2.5 font-medium text-right">
                      Montant
                    </th>
                    <th className="px-5 py-2.5 font-medium">Statut</th>
                    <th className="px-5 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {awardQueue.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-ink-50 hover:bg-ink-50/40"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-ink-500">
                        {r.requisitionNumber}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink-900">{r.title}</div>
                        <div className="text-[11px] text-ink-500">
                          {r.requester.fullName} · {r.project.projectCode}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink-900">
                        {formatCurrency(r.amount, r.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/requisitions/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          Émettre PO →
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

      {/* Active orders tracking */}
      <Card>
        <CardHeader
          title="Étape 3 — Suivi des marchés actifs"
          description="Bons de commande émis, en attente de réception"
          action={
            <Badge className="bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              {activeOrders.length} actif(s)
            </Badge>
          }
        />
        <CardBody className="px-0 py-0">
          {activeOrders.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="Aucune commande active"
                description="Les PO en attente de livraison apparaissent ici."
                icon={ClipboardList}
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
                    <th className="px-5 py-2.5 font-medium text-right">
                      Montant
                    </th>
                    <th className="px-5 py-2.5 font-medium">Statut</th>
                    <th className="px-5 py-2.5 font-medium">Émis</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((po) => (
                    <tr
                      key={po.id}
                      className="border-b border-ink-50 hover:bg-ink-50/40"
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
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {po.supplier.companyName}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink-900">
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
                        {relativeFromNow(po.issuedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/40 px-4 py-3 text-xs text-purple-900">
        <ClipboardCheck className="mr-1 inline h-3.5 w-3.5" />
        <strong>Cycle Achats :</strong> Classifier → Lancer la consultation
        → Comparer les offres → Attribuer le marché → Émettre le PO →
        Suivre la livraison. Toutes les actions sont consignées au journal
        d&apos;audit et l&apos;Officier Achats ne peut pas modifier les
        données originales de la réquisition (TDR §4.4).
      </div>
    </div>
  );
}
