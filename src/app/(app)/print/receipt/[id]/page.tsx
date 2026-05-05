import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  RECEIPT_TYPE_LABEL,
  type ReceiptType,
} from "@/lib/enums";
import {
  PdfMeta,
  PdfSectionTitle,
  PdfSignatureBlock,
  PrintShell,
} from "@/components/print/PrintShell";

export const dynamic = "force-dynamic";

export default async function PrintableReceipt({
  params,
}: {
  params: { id: string };
}) {
  await requireUser();
  const receipt = await prisma.goodsReceipt.findUnique({
    where: { id: params.id },
    include: {
      receivedBy: true,
      requisition: { include: { requester: true, project: true } },
      purchaseOrder: { include: { supplier: true } },
    },
  });
  if (!receipt) notFound();
  const isService = receipt.receiptType === "SAN";
  const docLabel = isService
    ? "Constat d'Acceptation de Service"
    : "Bon de Réception";

  return (
    <PrintShell
      documentLabel={docLabel}
      documentNumber={`${receipt.receiptType}-${receipt.id.slice(-6).toUpperCase()}`}
      classification="Officiel · PV de réception"
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[26px] font-semibold leading-none tracking-tight text-ink-900">
            {docLabel}
          </h1>
          <p className="mt-2 text-[12px] text-ink-600">
            {RECEIPT_TYPE_LABEL[receipt.receiptType as ReceiptType]} —
            réception {isService ? "de la prestation" : "des biens"} commandés
            auprès de {receipt.purchaseOrder.supplier.companyName}.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700">
            Réception
          </div>
          <div className="font-serif text-[15px] font-semibold text-ink-900">
            {formatDate(receipt.receivedDate)}
          </div>
        </div>
      </div>

      <PdfSectionTitle>Références</PdfSectionTitle>
      <PdfMeta
        items={[
          {
            label: "Bon de Commande",
            value: (
              <span className="font-mono">
                {receipt.purchaseOrder.poNumber}
              </span>
            ),
          },
          {
            label: "Réquisition",
            value: (
              <span className="font-mono">
                {receipt.requisition.requisitionNumber}
              </span>
            ),
          },
          { label: "Fournisseur", value: receipt.purchaseOrder.supplier.companyName },
          { label: "Projet", value: receipt.requisition.project.projectCode },
          { label: "Réceptionné par", value: receipt.receivedBy.fullName },
          { label: "Demandeur", value: receipt.requisition.requester.fullName },
        ]}
      />

      <div className="mt-8">
        <PdfSectionTitle>Constat de réception</PdfSectionTitle>
        <div className="rounded-sm border border-ink-200 bg-white/70 p-4 text-[11.5px] text-ink-800">
          <p>
            <strong>Objet :</strong> {receipt.requisition.title}
          </p>
          <p className="mt-2">
            <strong>Quantité réceptionnée :</strong>{" "}
            {receipt.requisition.quantity.toLocaleString("fr-FR")}{" "}
            {receipt.requisition.unit}
          </p>
          {receipt.notes ? (
            <p className="mt-2 whitespace-pre-line">
              <strong>Observations :</strong> {receipt.notes}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <PdfSectionTitle>Conformité</PdfSectionTitle>
        {receipt.discrepancyFlag ? (
          <div className="rounded-sm border border-amber-300 bg-amber-50 p-4 text-[11.5px] text-amber-900">
            <strong>Écart constaté.</strong>{" "}
            {receipt.discrepancyNotes ?? "Détail à compléter."}
            <p className="mt-2 text-amber-800">
              Le présent constat est émis sous réserve. Action corrective
              requise auprès du fournisseur.
            </p>
          </div>
        ) : (
          <div className="rounded-sm border border-emerald-300 bg-emerald-50 p-4 text-[11.5px] text-emerald-900">
            <strong>Réception conforme.</strong>{" "}
            {isService
              ? "La prestation est acceptée sans réserve."
              : "Les biens livrés correspondent à la commande passée."}
          </div>
        )}
      </div>

      <PdfSignatureBlock
        signatures={[
          { role: "Réceptionnaire", line: "Signature du contrôleur" },
          { role: "Fournisseur", line: "Pour livraison" },
          { role: "Officier Achats", line: "Visa de classement" },
        ]}
      />

      <div className="mt-10 flex items-center justify-between border-t border-ink-200 pt-3 text-[9.5px] text-ink-500">
        <span>
          {docLabel} · PO {receipt.purchaseOrder.poNumber} · Réquisition{" "}
          {receipt.requisition.requisitionNumber}
        </span>
        <span>Page 1 / 1</span>
      </div>
    </PrintShell>
  );
}
