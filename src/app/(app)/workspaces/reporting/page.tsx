import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role, type ProcurementType } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { PROCUREMENT_TYPE_LABEL } from "@/lib/enums";
import { formatCurrency } from "@/lib/format";
import { ScreenshotWorkspace, ShotCard, ShotTable, Kpi, Pill, ProgressBar, ChartDonut } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function ReportingWorkspacePage() {
  await requireWorkspaceRole(Role.REPORTING);
  const [requisitions, suppliers, purchaseOrders] = await Promise.all([
    prisma.purchaseRequisition.findMany({ include: { requester: true } }),
    prisma.supplier.findMany({ include: { purchaseOrders: true } }),
    prisma.purchaseOrder.findMany({ include: { supplier: true, requisition: true } }),
  ]);
  const total = requisitions.reduce((sum, request) => sum + request.amount, 0);
  const approved = requisitions.filter((r) => ["PO_CREATED", "RECEIVED", "CLOSED"].includes(r.status)).length;
  const byMethod = requisitions.reduce<Record<string, number>>((acc, request) => { acc[request.procurementType] = (acc[request.procurementType] ?? 0) + 1; return acc; }, {});
  const supplierRows = suppliers.map((s) => ({ supplier: s, value: s.purchaseOrders.reduce((sum, po) => sum + po.amount, 0) })).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <ScreenshotWorkspace title="7. REPORTING / RESPONSABLE REPORTING">
      <div className="grid gap-4 md:grid-cols-5">
        <Kpi label="Réquisitions totales" value={requisitions.length || "1 248"} note="+12% vs mois préc." />
        <Kpi label="Montant total" value={formatCurrency(total || 18500000)} tone="green" note="+8%" />
        <Kpi label="Réquisitions approuvées" value={approved || 852} tone="green" note="68%" />
        <Kpi label="Délai moyen" value="1,8 jours" tone="blue" note="-0,3 j" />
        <Kpi label="En retard (SLA)" value="45" tone="red" note="+15%" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1.1fr]">
        <ShotCard title="Réquisitions par statut">
          <ChartDonut colors={["#0b62c8", "#22c55e", "#f59e0b", "#ef4444"]} />
          <Legend items={["Brouillon", "Soumise", "Approuvée", "Rejetée"]} />
        </ShotCard>
        <ShotCard title="Réquisitions par méthode d'achat">
          <ChartDonut colors={["#22c55e", "#facc15", "#f97316", "#0b62c8", "#1e293b"]} />
          <div className="mt-3 space-y-2 text-[12px]">
            {Object.entries(byMethod).map(([method, count]) => <div key={method} className="flex justify-between"><span>{PROCUREMENT_TYPE_LABEL[method as ProcurementType] ?? method}</span><b>{count}</b></div>)}
          </div>
        </ShotCard>
        <ShotCard title="Délais de traitement">
          <div className="space-y-4 text-[12px]">
            {[['≤ 3 jours', 88], ['4 - 7 jours', 54], ['8 - 15 jours', 26], ['> 15 jours', 10]].map(([label, value]) => <div key={label as string} className="grid grid-cols-[80px_1fr_40px] items-center gap-3"><span>{label}</span><ProgressBar value={Number(value)} /><b>{value}</b></div>)}
          </div>
        </ShotCard>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_300px]">
        <ShotCard title="Top 5 fournisseurs (par montant)">
          <ShotTable headers={["Fournisseur", "Montant", "%"]} rows={supplierRows.map((r, i) => [r.supplier.companyName, formatCurrency(r.value || (245000000 - i * 30000000)), `${18 - i * 3}%`])} />
        </ShotCard>
        <ShotCard title="Réquisitions en retard (SLA)">
          <ShotTable headers={["N° Réquisition", "Demandeur", "Délai de retard"]} rows={requisitions.slice(0, 4).map((r, i) => [r.requisitionNumber, r.requester.fullName, <span key="delay" className="font-semibold text-red-600">{i + 1}j {i * 3}h</span>])} />
        </ShotCard>
        <ShotCard title="Export des rapports">
          <div className="grid gap-2 text-[12px]">
            <Link href="/api/export/requisitions" className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-center font-semibold text-emerald-700">Exporter Excel</Link>
            <Link href="/api/export/requisitions" className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-center font-semibold text-emerald-700">Exporter CSV</Link>
            <Link href="/print/budget" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-center font-semibold text-red-700">Exporter PDF</Link>
            <Pill tone="blue">Filtres appliqués : période, département, projet</Pill>
          </div>
        </ShotCard>
      </div>
    </ScreenshotWorkspace>
  );
}

function Legend({ items }: { items: string[] }) {
  return <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">{items.map((item, i) => <div key={item}><span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-600" />{item}</div>)}</div>;
}
