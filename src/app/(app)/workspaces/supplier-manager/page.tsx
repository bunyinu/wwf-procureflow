import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role, type DueDiligenceStatus, type SupplierStatus } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Field, WorkspaceHeader } from "../_shared";
import { DUE_DILIGENCE_BADGE, DUE_DILIGENCE_LABEL, SUPPLIER_STATUS_BADGE, SUPPLIER_STATUS_LABEL } from "@/lib/enums";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SupplierManagerWorkspacePage() {
  await requireWorkspaceRole(Role.SUPPLIER_MANAGER);
  const workspace = WORKSPACE_BY_ROLE.SUPPLIER_MANAGER;
  const suppliers = await prisma.supplier.findMany({
    include: { purchaseOrders: { include: { requisition: true } } },
    orderBy: [{ status: "asc" }, { companyName: "asc" }],
  });
  const selected = suppliers[0];
  const linkedOrders = selected?.purchaseOrders ?? [];

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader title="Left · Supplier list" action={<Link href="/suppliers" className="text-xs font-medium text-wwf-700">Open registry</Link>} />
          <CardBody className="space-y-2">
            {suppliers.slice(0, 10).map((supplier) => (
              <Link key={supplier.id} href={`/suppliers/${supplier.id}`} className="block rounded-md border border-ink-100 px-3 py-2 text-sm hover:border-rose-200 hover:bg-rose-50/30">
                <div className="font-medium text-ink-900">{supplier.companyName}</div>
                <div className="text-xs text-ink-500">{supplier.contactName ?? "No contact"}</div>
              </Link>
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Center · Supplier profile" description={selected?.companyName ?? "No supplier selected"} />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {selected ? (
              <>
                <Field label="Supplier status" value={<Badge className={SUPPLIER_STATUS_BADGE[selected.status as SupplierStatus]}>{SUPPLIER_STATUS_LABEL[selected.status as SupplierStatus]}</Badge>} />
                <Field label="Prequalification status" value={selected.status === "PREQUALIFIED" ? "Prequalified" : "Not prequalified"} />
                <Field label="Due diligence docs" value={selected.antiCorruptionSignedAt ? `Annexe B signed ${formatDate(selected.antiCorruptionSignedAt)}` : "Annexe B pending"} />
                <Field label="Supplier history" value={`${linkedOrders.length} linked order(s), score ${selected.score}/100`} />
                <Field label="Email / phone" value={`${selected.email ?? "—"} · ${selected.phone ?? "—"}`} />
                <Field label="Address" value={selected.address ?? "—"} />
              </>
            ) : (
              <p className="text-sm text-ink-500">No supplier in registry.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · Due diligence checklist" />
          <CardBody className="space-y-3 text-xs">
            {selected ? (
              <>
                <Badge className={DUE_DILIGENCE_BADGE[selected.dueDiligenceStatus as DueDiligenceStatus]}>
                  {DUE_DILIGENCE_LABEL[selected.dueDiligenceStatus as DueDiligenceStatus]}
                </Badge>
                <ul className="space-y-1.5 text-ink-700">
                  <li>Tax ID verified: {selected.taxId ? "yes" : "pending"}</li>
                  <li>Anti-corruption attestation: {selected.antiCorruptionSignedAt ? "signed" : "pending"}</li>
                  <li>Prequalification decision: {selected.status}</li>
                  <li>Blocked/pending/approved status controlled here only.</li>
                </ul>
              </>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Bottom · Linked requests/orders" description="Supplier Manager can see linked orders but cannot award markets alone or close delivery." />
        <CardBody className="px-0 py-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500"><th className="px-5 py-2.5">PO</th><th className="px-5 py-2.5">Request</th><th className="px-5 py-2.5 text-right">Amount</th><th className="px-5 py-2.5">Status</th></tr></thead>
            <tbody>
              {linkedOrders.map((po) => (
                <tr key={po.id} className="border-b border-ink-50">
                  <td className="px-5 py-3 font-mono text-xs text-ink-500">{po.poNumber}</td>
                  <td className="px-5 py-3"><Link href={`/requisitions/${po.requisitionId}`} className="font-medium text-ink-900 hover:text-wwf-700">{po.requisition.title}</Link></td>
                  <td className="px-5 py-3 text-right font-medium text-ink-900">{formatCurrency(po.amount, po.currency)}</td>
                  <td className="px-5 py-3 text-xs text-ink-700">{po.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {linkedOrders.length === 0 ? <p className="px-5 py-4 text-sm text-ink-500">No linked orders for selected supplier.</p> : null}
        </CardBody>
      </Card>
    </div>
  );
}
