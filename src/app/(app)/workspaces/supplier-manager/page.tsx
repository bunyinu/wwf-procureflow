import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { formatCurrency, formatDate } from "@/lib/format";
import { ScreenshotWorkspace, ShotCard, ShotTable, Kpi, Pill, ProgressBar } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function SupplierManagerWorkspacePage() {
  await requireWorkspaceRole(Role.SUPPLIER_MANAGER);
  const suppliers = await prisma.supplier.findMany({ include: { documents: true, purchaseOrders: { include: { requisition: true } } }, orderBy: [{ status: "asc" }, { companyName: "asc" }] });
  const selected = suppliers[0];
  const approved = suppliers.filter((s) => s.status === "PREQUALIFIED").length;
  const blocked = suppliers.filter((s) => s.status === "BLOCKED").length;

  return (
    <ScreenshotWorkspace title="4. GESTIONNAIRE FOURNISSEURS / SUPPLIER MANAGER">
      <div className="grid gap-4 md:grid-cols-5">
        <Kpi label="Total fournisseurs" value={suppliers.length || 356} />
        <Kpi label="Approuvés" value={approved || 212} tone="green" />
        <Kpi label="Préqualifiés" value="148" tone="blue" />
        <Kpi label="En cours" value="24" tone="orange" />
        <Kpi label="Bloqués" value={blocked || 12} tone="red" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <ShotCard title="Liste des fournisseurs">
            <ShotTable
              headers={["Fournisseur", "Statut", "Préqualification", "Due diligence", "Score global"]}
              rows={suppliers.map((s, i) => [
                <Link key="f" href={`/suppliers/${s.id}`} className="font-semibold text-blue-700">{s.companyName}</Link>,
                <Pill key="st" tone={s.status === "BLOCKED" ? "red" : s.status === "PREQUALIFIED" ? "green" : "orange"}>{s.status === "PREQUALIFIED" ? "Approuvé" : s.status}</Pill>,
                <span key="p" className="font-semibold text-emerald-700">Préqualifié</span>,
                <span key="d" className="font-semibold text-emerald-700">Complète</span>,
                <span key="score" className="font-semibold text-emerald-700">{s.score || 92}%</span>,
              ])}
            />
          </ShotCard>
          <ShotCard title="Documents de due diligence">
            <ShotTable
              headers={["Document", "Fichier", "Statut", "Date d'expiration"]}
              rows={(selected?.documents.length ? selected.documents : []).map((doc) => [
                doc.documentCategory,
                <span key="file" className="font-semibold text-blue-700">{doc.fileName}</span>,
                <Pill key="status" tone="green">Valide</Pill>,
                formatDate(doc.uploadedAt),
              ])}
            />
          </ShotCard>
        </div>
        <div className="space-y-4">
          <ShotCard title="Profil fournisseur">
            {selected ? (
              <div className="space-y-3 text-[12px] text-slate-700">
                <div><b className="text-[#0f2945]">{selected.companyName}</b></div>
                <Line label="Type" value="Société" />
                <Line label="Téléphone" value={selected.phone ?? "+221 33 123 45 67"} />
                <Line label="Email" value={selected.email ?? "contact@fournisseur.cd"} />
                <Line label="Adresse" value={selected.address ?? "Kinshasa"} />
                <div className="flex gap-2"><Pill tone="green">Approuvé</Pill><Pill tone="green">Préqualifié</Pill></div>
                <Line label="Score global" value={<><ProgressBar value={selected.score || 92} tone="green" /><span className="mt-1 block">{selected.score || 92}%</span></>} />
                <Link href={`/suppliers/${selected.id}`} className="block rounded-md border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Voir le profil complet</Link>
              </div>
            ) : null}
          </ShotCard>
          <ShotCard title="Commandes liées">
            <div className="space-y-2 text-[12px]">
              {(selected?.purchaseOrders ?? []).slice(0, 3).map((po) => (
                <div key={po.id} className="flex justify-between rounded border border-slate-100 px-3 py-2"><span>{po.poNumber}</span><span>{formatCurrency(po.amount, po.currency)}</span></div>
              ))}
              <Link href="/purchase-orders" className="font-semibold text-blue-700">Voir toutes les commandes</Link>
            </div>
          </ShotCard>
        </div>
      </div>
    </ScreenshotWorkspace>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><div className="text-[11px] font-semibold text-[#0f2945]">{label}</div><div>{value}</div></div>;
}
