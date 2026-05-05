import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/workflow";
import type { Role } from "@/lib/enums";
import {
  PdfMeta,
  PdfSectionTitle,
  PrintShell,
} from "@/components/print/PrintShell";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  const today = new Date().toISOString().slice(0, 10);
  return { title: `Rapport-Audit-${today}-WWF-RDC` };
}

export default async function PrintableAudit({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  await requireUser();
  const from = searchParams.from ? new Date(searchParams.from) : null;
  const to = searchParams.to ? new Date(searchParams.to + "T23:59:59") : null;
  const logs = await prisma.auditLog.findMany({
    where: {
      ...(from || to
        ? {
            timestamp: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: { actor: true },
    orderBy: { timestamp: "desc" },
    take: 500,
  });
  const generated = new Date();

  return (
    <PrintShell
      documentLabel="Rapport d'Audit"
      documentNumber={`AUD-${generated.toISOString().slice(0, 10)}`}
      classification="Officiel · Restitution chronologique"
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[26px] font-semibold leading-none tracking-tight text-ink-900">
            Rapport du Journal d&apos;Audit
          </h1>
          <p className="mt-2 text-[12px] text-ink-600">
            Restitution chronologique des actions consignées sur la
            plateforme. Le journal est append-only et infalsifiable.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700">
            Édité le
          </div>
          <div className="font-serif text-[15px] font-semibold text-ink-900">
            {formatDate(generated)}
          </div>
        </div>
      </div>

      <PdfSectionTitle>Périmètre du rapport</PdfSectionTitle>
      <PdfMeta
        items={[
          {
            label: "Date de début",
            value: from ? formatDate(from) : "Origine",
          },
          {
            label: "Date de fin",
            value: to ? formatDate(to) : formatDate(generated),
          },
          {
            label: "Nombre d'événements",
            value: <span className="font-mono">{logs.length}</span>,
          },
        ]}
      />

      <div className="mt-8">
        <PdfSectionTitle>Événements</PdfSectionTitle>
        <div className="overflow-hidden rounded-sm border border-ink-300 bg-white">
          <table className="w-full border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-gradient-to-b from-ink-100 to-ink-50/40 text-left text-[9.5px] uppercase tracking-wider text-ink-700">
                <th className="px-3 py-2 font-semibold">Horodatage</th>
                <th className="px-3 py-2 font-semibold">Acteur</th>
                <th className="px-3 py-2 font-semibold">Rôle</th>
                <th className="px-3 py-2 font-semibold">Action</th>
                <th className="px-3 py-2 font-semibold">Entité</th>
                <th className="px-3 py-2 font-semibold">Avant → Après</th>
                <th className="px-3 py-2 font-semibold">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr
                  key={l.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-ink-50/30"}
                >
                  <td className="border-t border-ink-200 px-3 py-1.5 font-mono text-[10px]">
                    {formatDateTime(l.timestamp)}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-1.5">
                    {l.actor?.fullName ?? "—"}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-1.5 text-ink-600">
                    {l.actorRole ? ROLE_LABELS[l.actorRole as Role] : "—"}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-1.5 font-mono">
                    {l.action}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-1.5 text-ink-600">
                    {l.entityType}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-1.5 text-ink-700">
                    {l.oldValue ?? "—"} → {l.newValue ?? "—"}
                  </td>
                  <td className="border-t border-ink-200 px-3 py-1.5 text-ink-600">
                    {l.comment ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-sm border border-gold-300/70 bg-gold-50/50 p-4 text-[11px] text-ink-800">
        <strong>Attestation :</strong> le présent rapport reflète fidèlement
        l&apos;ensemble des actions consignées au journal pour le périmètre
        défini ci-dessus. Aucun évènement ne peut être modifié ni supprimé
        après émission. Le hash chaîné garantit l&apos;intégrité de
        l&apos;historique.
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-ink-200 pt-3 text-[9.5px] text-ink-500">
        <span>
          Rapport édité le {formatDateTime(generated)} ·{" "}
          {logs.length} événements
        </span>
        <span>Page 1 / 1</span>
      </div>
    </PrintShell>
  );
}
