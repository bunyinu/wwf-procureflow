import Link from "next/link";
import { Award, ClipboardCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { Role, type ProcurementType } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { PROCUREMENT_METHODS_FROM_PDF, WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { selectProcurementMethodAction } from "../../requisitions/actions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/Badge";
import { ContractStrip, Field, WorkspaceHeader } from "../_shared";
import { PROCUREMENT_TYPE_LABEL } from "@/lib/enums";
import { formatCurrency, relativeFromNow } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProcurementOfficerWorkspacePage() {
  await requireWorkspaceRole(Role.PROCUREMENT);
  const workspace = WORKSPACE_BY_ROLE.PROCUREMENT;
  const [waiting, awardQueue, activeOrders, supplierPool] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: { status: "PROCUREMENT_REVIEW" },
      include: { requester: true, department: true, project: true, budgetLine: true, quotes: { include: { supplier: true } } },
      orderBy: [{ priority: "desc" }, { submittedAt: "asc" }],
      take: 8,
    }),
    prisma.purchaseRequisition.findMany({
      where: { status: "PO_CREATED", purchaseOrders: { none: {} } },
      include: { requester: true, project: true, budgetLine: true },
      orderBy: { updatedAt: "asc" },
      take: 8,
    }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ["ISSUED", "PARTIALLY_RECEIVED"] } },
      include: { supplier: true, requisition: true },
      orderBy: { issuedAt: "desc" },
      take: 8,
    }),
    prisma.supplier.findMany({ where: { status: "PREQUALIFIED", dueDiligenceStatus: "CLEARED" }, orderBy: { score: "desc" }, take: 8 }),
  ]);
  const selected = waiting[0];

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <ContractStrip workspace={workspace} />

      <Card>
        <CardHeader title="Top · Approved requests waiting procurement" description="Business approval is already complete before this workspace acts." />
        <CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {waiting.map((request) => (
            <Link key={request.id} href={`/requisitions/${request.id}`} className="rounded-lg border border-ink-100 bg-white p-3 shadow-sm hover:border-purple-200 hover:bg-purple-50/30">
              <div className="font-mono text-[11px] text-ink-500">{request.requisitionNumber}</div>
              <div className="mt-2 line-clamp-2 text-sm font-medium text-ink-900">{request.title}</div>
              <div className="mt-1 text-xs text-ink-500">{request.department.name} · {request.project.projectCode}</div>
              <div className="mt-2 flex items-center justify-between gap-2"><StatusBadge status={request.status} /><span className="text-xs font-medium text-ink-800">{formatCurrency(request.amount, request.currency)}</span></div>
            </Link>
          ))}
          {waiting.length === 0 ? <p className="text-sm text-ink-500">No approved requests awaiting procurement.</p> : null}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Center · Procurement method selector" description="Methods are exactly the PDF list." />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PROCUREMENT_METHODS_FROM_PDF.map((method) => (
                <Badge key={method.value} className="bg-purple-50 text-purple-700 ring-1 ring-purple-100">
                  {method.label}
                </Badge>
              ))}
            </div>
            {selected ? (
              <form action={selectProcurementMethodAction} className="rounded-lg border border-ink-100 bg-ink-50/40 p-4">
                <input type="hidden" name="id" value={selected.id} />
                <Field label="Selected request" value={`${selected.requisitionNumber} · ${selected.title}`} />
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label className="text-xs font-medium text-ink-700">Procurement method</label>
                    <select name="procurementType" defaultValue={selected.procurementType} className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm">
                      {PROCUREMENT_METHODS_FROM_PDF.map((method) => (
                        <option key={method.value} value={method.value}>{method.label}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                    Save method
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-ink-500">Approval to the next step is blocked until a non-unclassified method is saved.</p>
              </form>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · Process checklist" />
          <CardBody>
            <ol className="space-y-2 text-xs text-ink-700">
              <li><ClipboardCheck className="mr-1 inline h-3.5 w-3.5 text-purple-600" /> Choose method</li>
              <li>Define steps/responsibilities</li>
              <li>Launch sourcing/RFQ/tender</li>
              <li>Analyze offers</li>
              <li><Award className="mr-1 inline h-3.5 w-3.5 text-indigo-600" /> Award supplier</li>
              <li>Track order</li>
            </ol>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Bottom · Offer analysis / award panel" description="Award can only use prequalified and cleared suppliers." />
        <CardBody className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500"><th className="px-3 py-2">Request</th><th className="px-3 py-2">Method</th><th className="px-3 py-2">Offers</th><th className="px-3 py-2">Award status</th></tr></thead>
              <tbody>
                {[...waiting, ...awardQueue].map((request) => (
                  <tr key={request.id} className="border-b border-ink-50">
                    <td className="px-3 py-2"><Link href={`/requisitions/${request.id}`} className="font-medium text-ink-900 hover:text-wwf-700">{request.requisitionNumber}</Link><div className="text-xs text-ink-500">{request.title}</div></td>
                    <td className="px-3 py-2 text-xs text-ink-700">{PROCUREMENT_TYPE_LABEL[request.procurementType as ProcurementType]}</td>
                    <td className="px-3 py-2 text-xs text-ink-700">{quoteCount(request)}</td>
                    <td className="px-3 py-2"><StatusBadge status={request.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-ink-500"><Truck className="h-3.5 w-3.5" /> Cleared supplier pool</div>
            <ul className="space-y-2 text-xs">
              {supplierPool.map((supplier) => (
                <li key={supplier.id} className="rounded-md border border-ink-100 px-3 py-2">
                  <div className="font-medium text-ink-900">{supplier.companyName}</div>
                  <div className="text-ink-500">Score {supplier.score}/100 · due diligence cleared</div>
                </li>
              ))}
            </ul>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Order tracking" description={`${activeOrders.length} active order(s)`} />
        <CardBody className="space-y-2">
          {activeOrders.map((po) => (
            <div key={po.id} className="flex items-center justify-between gap-3 rounded-md border border-ink-100 px-3 py-2 text-sm">
              <div><span className="font-mono text-xs text-ink-500">{po.poNumber}</span><div className="font-medium text-ink-900">{po.requisition.title}</div></div>
              <div className="text-right text-xs text-ink-500">{po.supplier.companyName}<br />{relativeFromNow(po.issuedAt)}</div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function quoteCount(request: unknown): number | string {
  const quotes = (request as { quotes?: unknown }).quotes;
  return Array.isArray(quotes) ? quotes.length : "Ready";
}
