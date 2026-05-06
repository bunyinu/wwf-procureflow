import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { approvalTier, STATUS_LABELS } from "@/lib/workflow";
import { formatCurrency, formatDate } from "@/lib/format";
import { ScreenshotWorkspace, ShotCard, ShotTable, Kpi, Pill } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function ApproverWorkspacePage() {
  await requireWorkspaceRole(Role.APPROVER);
  const [queue, history] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: { status: { in: ["HIERARCHICAL_REVIEW", "THRESHOLD_REVIEW", "SUBMITTED"] } },
      include: { requester: true, department: true, project: true, budgetLine: true, approvals: { orderBy: { decidedAt: "desc" } } },
      orderBy: [{ priority: "desc" }, { submittedAt: "asc" }],
      take: 7,
    }),
    prisma.approval.findMany({ include: { requisition: true, approver: true }, orderBy: { decidedAt: "desc" }, take: 5 }),
  ]);
  const selected = queue[0];
  const tier = selected ? approvalTier(selected.amount) : null;

  return (
    <ScreenshotWorkspace title="2. APPROBATEUR HIÉRARCHIQUE / HIERARCHICAL APPROVER">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="À traiter" value={queue.length || 7} tone="blue" />
        <Kpi label="En retard (SLA)" value="2" tone="red" />
        <Kpi label="Traitées aujourd'hui" value="5" tone="navy" />
        <Kpi label="Délai moyen de traitement" value="1,6 jour" tone="navy" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <ShotCard title="File d'approbation">
          <ShotTable
            headers={["N° Réquisition", "Demandeur", "Département / Projet", "Montant", "Seuil", "Statut actuel", "SLA"]}
            rows={queue.map((r, index) => [
              <Link key="n" href={`/requisitions/${r.id}`} className="font-mono font-semibold text-blue-700">{r.requisitionNumber}</Link>,
              r.requester.fullName,
              `${r.department.name} / ${r.project.projectCode}`,
              formatCurrency(r.amount, r.currency),
              `Niveau ${approvalTier(r.amount).tier}`,
              <Pill key="s" tone="blue">{STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] ?? r.status}</Pill>,
              <span key="sla" className={index === 1 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{index === 1 ? "31 h" : "OK"}</span>,
            ])}
          />
        </ShotCard>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <ShotCard title="Détails de la réquisition sélectionnée">
            {selected ? (
              <div className="grid gap-2 text-[12px] text-slate-700">
                <Line label="Demandeur" value={selected.requester.fullName} />
                <Line label="Département / Projet" value={`${selected.department.name} / ${selected.project.projectCode}`} />
                <Line label="Description" value={selected.description ?? selected.title} />
                <Line label="Montant" value={formatCurrency(selected.amount, selected.currency)} />
                <Line label="Ligne budgétaire" value={selected.budgetLine.code} />
                <Line label="Seuil" value={`Niveau ${tier?.tier}`} />
              </div>
            ) : <p className="text-[12px] text-slate-500">Aucune requête.</p>}
          </ShotCard>
          <ShotCard title="Historique des décisions">
            <div className="space-y-2 text-[12px] text-slate-700">
              {history.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span>{formatDate(item.decidedAt)} · {item.decision}</span><span>{item.requisition.requisitionNumber}</span>
                </div>
              ))}
            </div>
          </ShotCard>
          <ShotCard title="Actions">
            <div className="space-y-2 text-[12px]">
              <button className="block w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-left font-semibold text-emerald-700">○ Approuver</button>
              <button className="block w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-left font-semibold text-orange-600">○ Retourner pour correction</button>
              <button className="block w-full rounded-md border border-red-200 bg-white px-3 py-2 text-left font-semibold text-red-600">○ Rejeter</button>
              <textarea placeholder="Saisir le commentaire..." className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-[12px]" />
            </div>
          </ShotCard>
        </div>
      </div>
    </ScreenshotWorkspace>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><div className="font-semibold text-[#0f2945]">{label}</div><div>{value}</div></div>;
}
