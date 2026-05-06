import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { createReceiptAction } from "../../requisitions/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { ScreenshotWorkspace, ShotCard, ShotTable, Kpi, Pill, FieldBox } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function ReceiverWorkspacePage() {
  await requireWorkspaceRole(Role.RECEIVER);
  const [pending, receipts] = await Promise.all([
    prisma.purchaseOrder.findMany({ where: { status: "ISSUED" }, include: { supplier: true, requisition: { include: { department: true, project: true } } }, orderBy: { issuedAt: "asc" }, take: 8 }),
    prisma.goodsReceipt.findMany({ include: { purchaseOrder: { include: { supplier: true } }, requisition: true }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);
  const selected = pending[0];

  return (
    <ScreenshotWorkspace title="5. RÉCEPTIONNAIRE / RECEIVER">
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Réceptions en attente" value={pending.length || 8} tone="blue" />
        <Kpi label="En retard" value="2" tone="red" />
        <Kpi label="Réceptions aujourd'hui" value="3" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <ShotCard title="Réceptions en attente">
            <ShotTable
              headers={["N° PO", "Fournisseur", "Type", "Description", "Qté commandée", "Date livraison prévue", "Statut"]}
              rows={pending.map((po) => [
                <Link key="po" href={`/requisitions/${po.requisitionId}`} className="font-mono font-semibold text-blue-700">{po.poNumber}</Link>,
                po.supplier.companyName,
                "Biens",
                po.requisition.title,
                `${po.requisition.quantity}`,
                formatDate(po.requisition.expectedDeliveryDate),
                <Pill key="s" tone="orange">En attente</Pill>,
              ])}
            />
          </ShotCard>
          <ShotCard title="Détails de la réception">
            {selected ? (
              <div className="grid gap-3 md:grid-cols-2 text-[12px]">
                <FieldBox label="N° PO" value={selected.poNumber} />
                <FieldBox label="Fournisseur" value={selected.supplier.companyName} />
                <FieldBox label="Type" value="Biens" />
                <FieldBox label="Description" value={selected.requisition.title} />
                <FieldBox label="Montant" value={formatCurrency(selected.amount, selected.currency)} />
                <FieldBox label="Projet" value={selected.requisition.project.projectCode} />
              </div>
            ) : <p className="text-[12px] text-slate-500">Aucune réception.</p>}
          </ShotCard>
        </div>
        <div className="space-y-4">
          <ShotCard title="Créer GRN / SAN">
            {selected ? (
              <form action={createReceiptAction} className="space-y-3 text-[12px]">
                <input type="hidden" name="purchaseOrderId" value={selected.id} />
                <div>
                  <label className="font-semibold text-[#0f2945]">Type de réception</label>
                  <div className="mt-2 flex gap-4"><label><input type="radio" name="receiptType" value="GRN" defaultChecked /> GRN (Biens)</label><label><input type="radio" name="receiptType" value="SAN" /> SAN (Services)</label></div>
                </div>
                <div><label className="font-semibold text-[#0f2945]">Date de réception *</label><input type="date" className="mt-1 w-full rounded border border-slate-200 px-3 py-2" /></div>
                <div><label className="font-semibold text-[#0f2945]">Qté reçue *</label><input type="number" defaultValue={selected.requisition.quantity} className="mt-1 w-full rounded border border-slate-200 px-3 py-2" /></div>
                <div><label className="font-semibold text-[#0f2945]">Conforme *</label><div className="mt-2 flex gap-4"><label><input type="radio" defaultChecked /> Oui</label><label><input type="radio" /> Non</label></div></div>
                <textarea name="notes" rows={4} placeholder="Matériel conforme, emballage intact." className="w-full rounded border border-slate-200 px-3 py-2" />
                <button className="w-full rounded-md bg-blue-700 px-3 py-2 font-semibold text-white">Enregistrer la réception</button>
              </form>
            ) : null}
          </ShotCard>
          <ShotCard title="Réceptions effectuées">
            <div className="space-y-2 text-[12px]">
              {receipts.map((r) => <div key={r.id} className="rounded border border-slate-100 px-3 py-2"><b>{r.purchaseOrder.poNumber}</b> · {r.receiptType}<br />{formatDate(r.receivedDate)}</div>)}
            </div>
          </ShotCard>
        </div>
      </div>
    </ScreenshotWorkspace>
  );
}
