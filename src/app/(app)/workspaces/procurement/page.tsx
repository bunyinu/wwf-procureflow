import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role, type ProcurementType } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { PROCUREMENT_METHODS_FROM_PDF } from "@/lib/workspaces";
import { PROCUREMENT_TYPE_LABEL } from "@/lib/enums";
import { formatCurrency, formatDate } from "@/lib/format";
import { ScreenshotWorkspace, ShotCard, ShotTable, Pill, FieldBox } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function ProcurementOfficerWorkspacePage() {
  await requireWorkspaceRole(Role.PROCUREMENT);
  const [waiting, awardQueue, suppliers] = await Promise.all([
    prisma.purchaseRequisition.findMany({ where: { status: "PROCUREMENT_REVIEW" }, include: { requester: true, department: true, project: true, budgetLine: true, quotes: { include: { supplier: true } } }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.purchaseRequisition.findMany({ where: { status: "PO_CREATED" }, include: { requester: true, department: true, project: true, budgetLine: true, quotes: { include: { supplier: true } } }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.supplier.findMany({ where: { status: "PREQUALIFIED", dueDiligenceStatus: "CLEARED" }, orderBy: { score: "desc" }, take: 4 }),
  ]);
  const selected = waiting[0] ?? awardQueue[0];
  const quotes = selected?.quotes ?? [];

  return (
    <ScreenshotWorkspace title="3. OFFICIER ACHATS / PROCUREMENT OFFICER">
      <div className="grid gap-4 xl:grid-cols-[360px_1fr_280px]">
        <ShotCard title="Réquisition sélectionnée *">
          {selected ? (
            <div className="space-y-3 text-[12px]">
              <div className="flex items-center justify-between"><b className="font-mono">{selected.requisitionNumber}</b><Pill tone="green">Approuvée</Pill></div>
              <FieldBox label="Demandeur" value={selected.requester.fullName} />
              <FieldBox label="Département / Projet" value={`${selected.department.name} / ${selected.project.projectCode}`} />
              <FieldBox label="Description" value={selected.description ?? selected.title} />
              <FieldBox label="Montant" value={formatCurrency(selected.amount, selected.currency)} />
              <FieldBox label="Ligne budgétaire" value={selected.budgetLine.code} />
            </div>
          ) : <p className="text-[12px] text-slate-500">Aucun dossier.</p>}
        </ShotCard>
        <ShotCard title="Méthode d'achat">
          <div className="space-y-4">
            <select defaultValue="TENDER" className="w-full rounded border border-slate-200 px-3 py-2 text-[12px]">
              {PROCUREMENT_METHODS_FROM_PDF.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
            </select>
            <div className="grid gap-2 md:grid-cols-2">
              {["Classification", "Plan de passation", "Sourcing / AO", "Analyse des offres", "Attribution", "PO émise", "Clôture"].map((step, index) => (
                <div key={step} className="flex items-center gap-2 text-[12px] text-slate-700"><span className={index < 2 ? "text-emerald-600" : index === 2 ? "text-blue-600" : "text-slate-400"}>●</span>{step}</div>
              ))}
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              <Tab title="Offres reçues" active />
              <Tab title="Analyse comparative" />
              <Tab title="Attribution" />
              <Tab title="Commandes (PO)" />
            </div>
            <ShotTable
              headers={["Fournisseur", "Montant", "Délai", "Score technique", "Statut"]}
              rows={(quotes.length ? quotes : suppliers.map((supplier, index) => ({ id: supplier.id, supplier, amount: selected?.amount ?? 5000, leadTimeDays: 5 + index, technicalScore: supplier.score, isWinner: index === 0 }))).map((q: any) => [
                <span key="f" className="font-semibold text-blue-700">{q.supplier.companyName}</span>,
                formatCurrency(q.amount, selected?.currency ?? "USD"),
                `${q.leadTimeDays ?? 5} jours`,
                `${q.technicalScore ?? q.supplier.score}%`,
                <Pill key="s" tone={q.isWinner ? "green" : "blue"}>{q.isWinner ? "Conforme" : "Conforme"}</Pill>,
              ])}
            />
          </div>
        </ShotCard>
        <div className="space-y-4">
          <ShotCard title="Action">
            <div className="space-y-2 text-[12px]">
              <div className="rounded-md border border-orange-200 bg-orange-50 p-3"><b>Offre gagnante</b><br />ETS Techno SARL<br />4 800 000 XOF</div>
              <Link href={selected ? `/requisitions/${selected.id}` : "/procurement"} className="block rounded-md bg-emerald-600 px-3 py-2 text-center font-semibold text-white">Sélectionner comme gagnant</Link>
              <Link href={selected ? `/requisitions/${selected.id}` : "/procurement"} className="block rounded-md border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Voir détails de l&apos;offre</Link>
            </div>
          </ShotCard>
          <ShotCard title="Dernière action">
            <p className="text-[12px] text-slate-700">AO lancée le {formatDate(new Date())} par Seifou Ouedraogo</p>
          </ShotCard>
          <ShotCard title="Prochaines étapes">
            <ul className="space-y-1 text-[12px] text-slate-700"><li>Analyse des offres pré-attribution</li><li>Documenter l&apos;attribution</li><li>Générer le PO</li></ul>
          </ShotCard>
        </div>
      </div>
    </ScreenshotWorkspace>
  );
}

function Tab({ title, active }: { title: string; active?: boolean }) {
  return <div className={`rounded border px-3 py-2 text-center text-[11px] font-semibold ${active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>{title}</div>;
}
