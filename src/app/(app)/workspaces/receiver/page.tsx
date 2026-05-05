import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { createReceiptAction } from "../../requisitions/actions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AttachmentsZone } from "@/components/AttachmentsZone";
import { Field, WorkspaceHeader } from "../_shared";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReceiverWorkspacePage() {
  await requireWorkspaceRole(Role.RECEIVER);
  const workspace = WORKSPACE_BY_ROLE.RECEIVER;
  const [pending, receipts] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { status: "ISSUED" },
      include: { supplier: true, requisition: { include: { documents: true, department: true, project: true } } },
      orderBy: { issuedAt: "asc" },
      take: 8,
    }),
    prisma.goodsReceipt.findMany({
      include: { purchaseOrder: { include: { supplier: true } }, requisition: true, receivedBy: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  const selected = pending[0];

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <Card>
        <CardHeader title="Top · Pending receptions" description={`${pending.length} order(s) awaiting GRN/SAN.`} />
        <CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pending.map((po) => (
            <Link key={po.id} href={`/requisitions/${po.requisitionId}`} className="rounded-lg border border-ink-100 bg-white p-3 shadow-sm hover:border-teal-200 hover:bg-teal-50/30">
              <div className="font-mono text-[11px] text-ink-500">{po.poNumber}</div>
              <div className="mt-2 line-clamp-2 text-sm font-medium text-ink-900">{po.requisition.title}</div>
              <div className="mt-1 text-xs text-ink-500">{po.supplier.companyName}</div>
              <div className="mt-2 text-xs font-medium text-ink-800">{formatCurrency(po.amount, po.currency)}</div>
            </Link>
          ))}
          {pending.length === 0 ? <p className="text-sm text-ink-500">No pending receptions.</p> : null}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Center · Order/request details" description={selected?.poNumber ?? "No pending PO"} />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {selected ? (
              <>
                <Field label="Supplier" value={selected.supplier.companyName} />
                <Field label="Ordered goods/services" value={selected.requisition.title} />
                <Field label="Quantity" value={`${selected.requisition.quantity} ${selected.requisition.unit}`} />
                <Field label="PO/order reference" value={selected.poNumber} />
                <Field label="Expected delivery" value={formatDate(selected.requisition.expectedDeliveryDate)} />
                <Field label="Attached documents" value={`${selected.requisition.documents.length} file(s)`} />
                <Field label="Department / project" value={`${selected.requisition.department.name} · ${selected.requisition.project.projectCode}`} />
                <Field label="Amount" value={formatCurrency(selected.amount, selected.currency)} />
              </>
            ) : (
              <p className="text-sm text-ink-500">No pending order selected.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · GRN/SAN form" description="Receiver only. No supplier selection or budget edits." />
          <CardBody>
            {selected ? (
              <form action={createReceiptAction} className="space-y-3 text-sm">
                <input type="hidden" name="purchaseOrderId" value={selected.id} />
                <div>
                  <label className="text-xs font-medium text-ink-700">Receipt type</label>
                  <select name="receiptType" defaultValue="GRN" className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm">
                    <option value="GRN">Create GRN</option>
                    <option value="SAN">Create Service Acceptance Note</option>
                  </select>
                </div>
                <textarea name="notes" rows={3} placeholder="Observations / validation notes" className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm" />
                <label className="flex items-center gap-2 text-xs text-ink-700">
                  <input type="checkbox" name="discrepancyFlag" className="h-4 w-4 rounded border-ink-300 text-teal-600" />
                  Flag discrepancy
                </label>
                <textarea name="discrepancyNotes" rows={2} placeholder="Discrepancy details" className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm" />
                <AttachmentsZone hint="Upload proof: delivery photo, signed waybill, service acceptance." />
                <button type="submit" className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">Validate delivery/service</button>
              </form>
            ) : (
              <p className="text-sm text-ink-500">No PO available for reception.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Bottom · Observations + attachments" />
        <CardBody className="space-y-2">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="rounded-md border border-ink-100 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-ink-900">{receipt.purchaseOrder.poNumber} · {receipt.purchaseOrder.supplier.companyName}</div>
                <Badge className={receipt.discrepancyFlag ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200" : "bg-teal-50 text-teal-700 ring-1 ring-teal-200"}>{receipt.discrepancyFlag ? "Discrepancy" : receipt.receiptType}</Badge>
              </div>
              <div className="mt-1 text-xs text-ink-500">{receipt.notes ?? "No observation"} · {formatDate(receipt.receivedDate)}</div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
