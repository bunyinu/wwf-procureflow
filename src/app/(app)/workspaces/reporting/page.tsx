import Link from "next/link";
import { AlertTriangle, Clock, FileSpreadsheet } from "lucide-react";
import { prisma } from "@/lib/db";
import { Role, type ProcurementType } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Stat } from "@/components/Stat";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeBars } from "@/components/charts/TypeBars";
import { WorkspaceHeader } from "../_shared";
import { PROCUREMENT_TYPE_LABEL } from "@/lib/enums";
import { STATUS_LABELS } from "@/lib/workflow";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportingWorkspacePage() {
  await requireWorkspaceRole(Role.REPORTING);
  const workspace = WORKSPACE_BY_ROLE.REPORTING;
  const [requisitions, suppliers, purchaseOrders] = await Promise.all([
    prisma.purchaseRequisition.findMany({ include: { department: true, project: true, purchaseOrders: true }, orderBy: { updatedAt: "desc" } }),
    prisma.supplier.findMany({ include: { purchaseOrders: true } }),
    prisma.purchaseOrder.findMany({ include: { supplier: true, requisition: true } }),
  ]);

  const byStatus = requisitions.reduce<Record<string, number>>((acc, request) => {
    acc[request.status] = (acc[request.status] ?? 0) + 1;
    return acc;
  }, {});
  const byMethod = requisitions.reduce<Record<string, number>>((acc, request) => {
    acc[request.procurementType] = (acc[request.procurementType] ?? 0) + request.amount;
    return acc;
  }, {});
  const methodChart = Object.entries(byMethod).map(([name, value]) => ({ name: PROCUREMENT_TYPE_LABEL[name as ProcurementType] ?? name, value }));
  const lateRequests = requisitions.filter((request) => ["HIERARCHICAL_REVIEW", "PROCUREMENT_REVIEW", "THRESHOLD_REVIEW"].includes(request.status) && request.submittedAt && request.submittedAt.getTime() < Date.now() - 3 * 86400000);
  const closedCycles = requisitions.filter((request) => request.status === "CLOSED" && request.submittedAt).map((request) => (request.updatedAt.getTime() - request.submittedAt!.getTime()) / 86400000);
  const avgDelay = closedCycles.length ? closedCycles.reduce((a, b) => a + b, 0) / closedCycles.length : 0;
  const totalValue = requisitions.reduce((sum, request) => sum + request.amount, 0);
  const supplierPerformance = suppliers.map((supplier) => ({
    supplier,
    orders: supplier.purchaseOrders.length,
    value: supplier.purchaseOrders.reduce((sum, order) => sum + order.amount, 0),
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Requisitions" value={requisitions.length} icon={FileSpreadsheet} tone="brand" hint="All statuses" />
        <Stat label="Portfolio value" value={formatCurrency(totalValue)} icon={FileSpreadsheet} tone="good" hint="USD equivalent" />
        <Stat label="Processing delays" value={closedCycles.length ? `${avgDelay.toFixed(1)} d` : "—"} icon={Clock} hint="Closed cycle average" />
        <Stat label="Late requests" value={lateRequests.length} icon={AlertTriangle} tone={lateRequests.length ? "warn" : "good"} hint=">3 days in current stage" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Center · Charts" description="Procurement method split and status mix." />
          <CardBody className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Procurement method split</div>
              <TypeBars data={methodChart} />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Requisitions by status</div>
              <div className="space-y-2">
                {Object.entries(byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-md border border-ink-100 px-3 py-2 text-sm">
                    <StatusBadge status={status} />
                    <span className="font-medium text-ink-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · Bottleneck/late-stage panel" />
          <CardBody className="space-y-2">
            {lateRequests.slice(0, 8).map((request) => (
              <Link key={request.id} href={`/requisitions/${request.id}`} className="block rounded-md border border-amber-100 bg-amber-50/30 px-3 py-2 text-xs">
                <div className="font-medium text-ink-900">{request.requisitionNumber}</div>
                <div className="text-ink-600">{STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]} · {formatDate(request.submittedAt)}</div>
              </Link>
            ))}
            {lateRequests.length === 0 ? <p className="text-sm text-ink-500">No late-stage requests.</p> : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Bottom · Exportable report table"
          description="No workflow actions or user permission changes are exposed here."
          action={
            <div className="flex flex-wrap gap-2">
              <a href="/api/export/requisitions" className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700">Export Excel/CSV</a>
              <Link href="/print/budget" target="_blank" className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700">Export PDF</Link>
            </div>
          }
        />
        <CardBody className="px-0 py-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500"><th className="px-5 py-2.5">Supplier</th><th className="px-5 py-2.5 text-right">Orders</th><th className="px-5 py-2.5 text-right">Value</th><th className="px-5 py-2.5">Score</th></tr></thead>
            <tbody>
              {supplierPerformance.map(({ supplier, orders, value }) => (
                <tr key={supplier.id} className="border-b border-ink-50">
                  <td className="px-5 py-3 font-medium text-ink-900">{supplier.companyName}</td>
                  <td className="px-5 py-3 text-right">{orders}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(value)}</td>
                  <td className="px-5 py-3 text-xs text-ink-700">{supplier.score}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
