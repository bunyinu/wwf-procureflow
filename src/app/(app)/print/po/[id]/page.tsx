import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  PROCUREMENT_TYPE_LABEL,
  type ProcurementType,
} from "@/lib/enums";
import {
  PdfMeta,
  PdfParty,
  PdfSectionTitle,
  PdfSignatureBlock,
  PrintShell,
} from "@/components/print/PrintShell";

export const dynamic = "force-dynamic";

export default async function PrintablePO({
  params,
}: {
  params: { id: string };
}) {
  await requireUser();
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      requisition: {
        include: {
          requester: true,
          department: true,
          project: true,
          budgetLine: true,
        },
      },
    },
  });
  if (!po) notFound();
  const r = po.requisition;
  const unitPrice = r.quantity > 0 ? po.amount / r.quantity : po.amount;

  return (
    <PrintShell
      documentLabel="Bon de Commande"
      documentNumber={po.poNumber}
      classification="Officiel · Engagement contractuel"
    >
      {/* Title */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[26px] font-semibold leading-none tracking-tight text-ink-900">
            Bon de Commande
          </h1>
          <p className="mt-2 text-[12px] text-ink-600">
            Engagement formel d&apos;achat émis par WWF-RDC dans le cadre du
            projet {r.project.projectCode} —{" "}
            <span className="text-ink-800">{r.project.name}</span>.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700">
            Émis le
          </div>
          <div className="font-serif text-[15px] font-semibold text-ink-900">
            {formatDate(po.issuedAt ?? po.createdAt)}
          </div>
        </div>
      </div>

      {/* Parties */}
      <PdfSectionTitle>Parties</PdfSectionTitle>
      <div className="mb-6 grid grid-cols-2 gap-8">
        <PdfParty
          label="Acheteur"
          name="WWF — République Démocratique du Congo"
          lines={[
            "4630, av. de la Science, Imm. 365 Offices Building (Entrée D)",
            "Commune de la Gombe — Kinshasa",
            "Numéro d'impôt : A0700478D",
            "Tél. 0976006100 · wwfdrc@wwfdrc.org",
          ]}
        />
        <PdfParty
          label="Fournisseur"
          name={po.supplier.companyName}
          lines={[
            po.supplier.address ?? "—",
            po.supplier.contactName ?? "—",
            po.supplier.email ?? "—",
            po.supplier.phone ?? "—",
            <span key="tax">
              ID fiscal :{" "}
              <span className="font-mono">{po.supplier.taxId ?? "—"}</span>
            </span>,
          ]}
        />
      </div>

      {/* Meta */}
      <PdfSectionTitle>Références dossier</PdfSectionTitle>
      <PdfMeta
        items={[
          {
            label: "Réquisition",
            value: <span className="font-mono">{r.requisitionNumber}</span>,
          },
          {
            label: "Type de procédure",
            value:
              PROCUREMENT_TYPE_LABEL[r.procurementType as ProcurementType],
          },
          {
            label: "Livraison souhaitée",
            value: formatDate(r.expectedDeliveryDate),
          },
          {
            label: "Département émetteur",
            value: r.department.name,
          },
          {
            label: "Ligne budgétaire",
            value: (
              <span>
                <span className="font-mono">{r.budgetLine.code}</span>
                <br />
                <span className="text-[11px] text-ink-600">
                  {r.budgetLine.label}
                </span>
              </span>
            ),
          },
          {
            label: "Demandeur",
            value: r.requester.fullName,
          },
        ]}
      />

      {/* Articles */}
      <div className="mt-8">
        <PdfSectionTitle>Articles commandés</PdfSectionTitle>
        <div className="overflow-hidden rounded-sm border border-ink-300 bg-white">
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr className="bg-gradient-to-b from-ink-100 to-ink-50/40 text-left">
                <th className="px-4 py-2.5 font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Désignation
                </th>
                <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Quantité
                </th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Unité
                </th>
                <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Prix unitaire
                </th>
                <th className="px-4 py-2.5 text-right font-semibold uppercase tracking-wide text-[10px] text-ink-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                <td className="border-t border-ink-200 px-4 py-3">
                  <div className="font-semibold text-ink-900">{r.title}</div>
                  <div className="mt-1 whitespace-pre-line text-[11px] text-ink-600">
                    {r.justification}
                  </div>
                </td>
                <td className="border-t border-ink-200 px-3 py-3 text-right font-mono">
                  {r.quantity.toLocaleString("fr-FR")}
                </td>
                <td className="border-t border-ink-200 px-3 py-3">{r.unit}</td>
                <td className="border-t border-ink-200 px-3 py-3 text-right font-mono">
                  {formatCurrency(unitPrice, po.currency)}
                </td>
                <td className="border-t border-ink-200 px-4 py-3 text-right font-mono font-semibold">
                  {formatCurrency(po.amount, po.currency)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={4}
                  className="border-t-2 border-ink-300 bg-ink-50/50 px-4 py-3 text-right text-[10.5px] font-semibold uppercase tracking-wider text-ink-700"
                >
                  Montant total HT engagé
                </td>
                <td className="border-t-2 border-ink-300 bg-ink-50/50 px-4 py-3 text-right">
                  <div className="font-serif text-lg font-semibold text-ink-900">
                    {formatCurrency(po.amount, po.currency)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Conditions */}
      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <PdfSectionTitle>Conditions de livraison</PdfSectionTitle>
          <p className="text-[11.5px] text-ink-700">
            Livraison à l&apos;adresse du Bureau National du Programme
            WWF-RDC, sur jours ouvrés, contre signature du Bon de Réception
            (GRN) ou du Constat d&apos;Acceptation de Service (SAN).
            Toute non-conformité fera l&apos;objet d&apos;un signalement
            documenté à l&apos;émission du PV de réception.
          </p>
        </div>
        <div>
          <PdfSectionTitle>Conditions de paiement</PdfSectionTitle>
          <p className="text-[11.5px] text-ink-700">
            Paiement à <strong>30 jours fin de mois</strong> après réception
            conforme et facture validée. Tout dépassement de délai
            d&apos;exécution non justifié pourra entraîner l&apos;application
            de pénalités contractuelles.
          </p>
        </div>
      </div>

      {/* Integrity clause */}
      <div className="mt-8 rounded-sm border border-gold-300/70 bg-gold-50/50 p-4">
        <PdfSectionTitle>Clause d&apos;intégrité — Annexe B</PdfSectionTitle>
        <p className="text-[11px] text-ink-800">
          Le fournisseur s&apos;engage formellement à ne recourir à aucun
          acte de corruption, trafic d&apos;influence, ni remise
          d&apos;avantage indu, conformément à la lettre de certification et
          d&apos;engagement de l&apos;Annexe B de l&apos;appel d&apos;offres.
          Toute violation entraîne la résiliation immédiate du présent bon
          de commande, le déclenchement de la clause de sanction, et la
          radiation de la liste des fournisseurs préqualifiés du WWF.
        </p>
      </div>

      {/* Signatures */}
      <PdfSignatureBlock
        signatures={[
          { role: "Officier Achats", line: "Signature & cachet" },
          { role: "Approbateur Finance", line: "Signature & cachet" },
          { role: "Direction Nationale", line: "Visa final" },
        ]}
      />

      {/* Reference footer */}
      <div className="mt-10 flex items-center justify-between border-t border-ink-200 pt-3 text-[9.5px] text-ink-500">
        <span>
          Référence dossier {r.requisitionNumber} · Projet{" "}
          {r.project.projectCode} · Ligne {r.budgetLine.code}
        </span>
        <span>Page 1 / 1</span>
      </div>
    </PrintShell>
  );
}
