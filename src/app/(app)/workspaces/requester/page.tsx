import Link from "next/link";
import { prisma } from "@/lib/db";
import { Priority, Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { createRequisitionAction } from "../../requisitions/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/workflow";
import { ScreenshotWorkspace, ShotCard, ShotTable, FieldBox, Pill, StatusStep } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function RequesterWorkspacePage() {
  const user = await requireWorkspaceRole(Role.REQUESTER);
  const [requests, departments, projects, budgetLines, lastReq] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: { requesterId: user.id },
      include: { department: true, project: true, budgetLine: true, documents: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { active: true }, orderBy: { projectCode: "asc" } }),
    prisma.budgetLine.findMany({ where: { active: true }, include: { project: true }, orderBy: { code: "asc" } }),
    prisma.purchaseRequisition.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);
  const nextNumber = `REQ-${new Date().getFullYear()}-${String((lastReq ? Number(lastReq.requisitionNumber.split("-").pop()) : 0) + 1).padStart(5, "0")}`;

  return (
    <ScreenshotWorkspace title="1. DEMANDEUR / REQUESTER">
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <ShotCard title="Nouvelle réquisition">
            <form action={createRequisitionAction} className="grid gap-3 md:grid-cols-3">
              <FieldBox label="Réquisition N°" value={<span className="font-mono text-blue-700">{nextNumber}</span>} />
              <div>
                <label className="text-[11px] font-semibold text-[#0f2945]">Département *</label>
                <select name="departmentId" defaultValue={user.departmentId ?? ""} className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-[12px]">
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#0f2945]">Projet *</label>
                <select name="projectId" className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-[12px]">
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} - {p.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-[11px] font-semibold text-[#0f2945]">Description</label>
                <input name="description" required defaultValue="Achat de matériels informatiques" className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-[12px]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#0f2945]">Quantité</label>
                <input name="quantity" type="number" min="1" defaultValue="10" className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-[12px]" />
              </div>
              <input type="hidden" name="unit" value="unité" />
              <div>
                <label className="text-[11px] font-semibold text-[#0f2945]">Montant budgétaire (USD)</label>
                <input name="amount" type="number" min="1" defaultValue="5000" className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-[12px]" />
              </div>
              <input type="hidden" name="currency" value="USD" />
              <div>
                <label className="text-[11px] font-semibold text-[#0f2945]">Ligne budgétaire *</label>
                <select name="budgetLineId" className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-[12px]">
                  {budgetLines.map((b) => <option key={b.id} value={b.id}>{b.code} - {b.label}</option>)}
                </select>
              </div>
              <input type="hidden" name="priority" value={Priority.NORMAL} />
              <div className="md:col-span-3">
                <label className="text-[11px] font-semibold text-[#0f2945]">Justification</label>
                <textarea name="justification" rows={2} required defaultValue="Ces équipements sont nécessaires pour renforcer la capacité des équipes terrain." className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-[12px]" />
              </div>
              <div className="md:col-span-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-[12px]">
                <div className="font-semibold text-[#0f2945]">Pièces jointes</div>
                <div className="mt-2 flex flex-wrap gap-2 text-blue-700">
                  <span>Justification_besoin.pdf</span><span className="text-slate-400">245 KB</span>
                  <span>Devis_fournisseur.pdf</span><span className="text-slate-400">508 KB</span>
                  <Link href="/requisitions/new" className="ml-auto rounded border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold">Ajouter une pièce jointe</Link>
                </div>
              </div>
              <div className="md:col-span-3 flex gap-2">
                <button name="intent" value="draft" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700">Enregistrer brouillon</button>
                <button name="intent" value="submit" className="rounded-md bg-blue-700 px-4 py-2 text-[12px] font-semibold text-white">Soumettre</button>
              </div>
            </form>
          </ShotCard>
          <ShotCard title="Mes réquisitions">
            <ShotTable
              headers={["N° Réquisition", "Description", "Montant (USD)", "Statut", "Dernière mise à jour"]}
              rows={requests.map((r) => [
                <Link key="n" href={`/requisitions/${r.id}`} className="font-mono font-semibold text-blue-700">{r.requisitionNumber}</Link>,
                <span key="d">{r.title}</span>,
                formatCurrency(r.amount, r.currency),
                <Pill key="s" tone={r.status === "REJECTED" ? "red" : r.status === "DRAFT" ? "gray" : "blue"}>{STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] ?? r.status}</Pill>,
                formatDate(r.updatedAt),
              ])}
            />
          </ShotCard>
        </div>
        <div className="space-y-4">
          <ShotCard title="Suivi de statut">
            <div className="space-y-4">
              <StatusStep done label="Brouillon" meta="20/05/2025 09:15" />
              <StatusStep active label="Soumise" meta="20/05/2025 09:47" />
              <StatusStep label="En cours de validation" meta="Hiérarchique 1" />
              <StatusStep label="Validation finale" />
              <StatusStep label="Terminée" />
            </div>
          </ShotCard>
          <ShotCard title="Commentaires / Retour">
            <div className="space-y-3 text-[12px] text-slate-700">
              <div className="rounded-md bg-slate-50 p-3">Veuillez expliciter la marque des équipements. <br /><b>— Approbateur Niveau 1</b></div>
              <Link href="/notifications" className="font-semibold text-blue-700">Voir tout l&apos;historique</Link>
            </div>
          </ShotCard>
        </div>
      </div>
    </ScreenshotWorkspace>
  );
}
