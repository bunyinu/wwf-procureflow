import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { formatDateTime } from "@/lib/format";
import { ScreenshotWorkspace, ShotCard, ShotTable, Pill } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function ArchiveAuditWorkspacePage({ searchParams }: { searchParams: { q?: string } }) {
  await requireWorkspaceRole(Role.AUDITOR);
  const q = (searchParams.q ?? "").trim();
  const [logs, docs, supplierDocs] = await Promise.all([
    prisma.auditLog.findMany({ include: { actor: true }, orderBy: { timestamp: "desc" }, take: 8 }),
    prisma.document.findMany({ include: { requisition: true, uploadedBy: true }, orderBy: { uploadedAt: "desc" }, take: 5 }),
    prisma.supplierDocument.findMany({ include: { supplier: true, uploadedBy: true }, orderBy: { uploadedAt: "desc" }, take: 5 }),
  ]);

  return (
    <ScreenshotWorkspace title="6. ARCHIVE & AUDIT / DOCUMENTS & AUDIT OFFICER">
      <ShotCard title="Recherche globale">
        <form className="grid gap-3 md:grid-cols-[1fr_130px_130px_130px_130px_auto] text-[12px]">
          <input name="q" defaultValue={q} placeholder="Rechercher par mot-clé, n° de document, fournisseur, utilisateur..." className="rounded border border-slate-200 px-3 py-2" />
          <select className="rounded border border-slate-200 px-3 py-2"><option>Type: Tous</option></select>
          <select className="rounded border border-slate-200 px-3 py-2"><option>Catégorie: Toutes</option></select>
          <input type="date" className="rounded border border-slate-200 px-3 py-2" />
          <input type="date" className="rounded border border-slate-200 px-3 py-2" />
          <button className="rounded bg-blue-700 px-4 py-2 font-semibold text-white">Rechercher</button>
        </form>
      </ShotCard>
      <ShotCard title={`Journal d'audit (${logs.length} actions)`}>
        <ShotTable
          headers={["Date / Heure", "Utilisateur", "Rôle", "Action", "Entité / Document", "Ancienne valeur", "Nouvelle valeur", "Décision / Commentaire"]}
          rows={logs.map((log) => [
            formatDateTime(log.timestamp),
            log.actor?.fullName ?? "Système",
            log.actorRole ?? "—",
            <Pill key="a" tone="blue">{log.action}</Pill>,
            log.entityType,
            log.oldValue ?? "—",
            log.newValue ?? "—",
            log.comment ?? "—",
          ])}
        />
      </ShotCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <ShotCard title="Documents archivés">
          <ShotTable
            headers={["Document", "Dossier", "Déposé par", "Date"]}
            rows={docs.map((doc) => [
              <Link key="d" href={`/print/requisition/${doc.requisitionId}`} className="font-semibold text-blue-700">{doc.fileName}</Link>,
              doc.requisition.requisitionNumber,
              doc.uploadedBy.fullName,
              formatDateTime(doc.uploadedAt),
            ])}
          />
        </ShotCard>
        <ShotCard title="Documents fournisseurs">
          <ShotTable
            headers={["Document", "Fournisseur", "Déposé par", "Statut"]}
            rows={supplierDocs.map((doc) => [
              <Link key="d" href={`/suppliers/${doc.supplierId}`} className="font-semibold text-blue-700">{doc.fileName}</Link>,
              doc.supplier.companyName,
              doc.uploadedBy.fullName,
              <Pill key="s" tone="green">Traçable</Pill>,
            ])}
          />
        </ShotCard>
      </div>
    </ScreenshotWorkspace>
  );
}
