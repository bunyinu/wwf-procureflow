import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  PdfMeta,
  PdfSectionTitle,
  PdfSignatureBlock,
  PrintShell,
} from "@/components/print/PrintShell";

export const dynamic = "force-dynamic";

export default async function PrintableBudget() {
  await requireUser();
  const [budgetLines, projects, requisitions] = await Promise.all([
    prisma.budgetLine.findMany({ include: { project: true }, orderBy: { code: "asc" } }),
    prisma.project.findMany(),
    prisma.purchaseRequisition.findMany({
      where: { status: { not: "CANCELLED" } },
    }),
  ]);

  const totalAllocated = budgetLines.reduce((s, b) => s + b.allocatedBudget, 0);
  const totalUsed = budgetLines.reduce(
    (s, b) => s + b.spentAmount + b.committedAmount,
    0,
  );
  const totalCommitted = requisitions.reduce((s, r) => s + r.amount, 0);
  const generated = new Date();

  return (
    <PrintShell
      documentLabel="État de Consommation Budgétaire"
      documentNumber={`BDG-${generated.toISOString().slice(0, 10)}`}
      classification="Officiel · Restitution Finance"
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[26px] font-semibold leading-none tracking-tight text-ink-900">
            État de Consommation Budgétaire
          </h1>
          <p className="mt-2 text-[12px] text-ink-600">
            Synthèse des engagements et dépenses par ligne budgétaire,
            consolidée à la date d&apos;édition.
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

      <PdfSectionTitle>Synthèse globale</PdfSectionTitle>
      <PdfMeta
        items={[
          {
            label: "Budget alloué",
            value: <span className="font-mono">{formatCurrency(totalAllocated)}</span>,
          },
          {
            label: "Engagé + dépensé",
            value: <span className="font-mono">{formatCurrency(totalUsed)}</span>,
          },
          {
            label: "Réquisitions actives",
            value: (
              <span className="font-mono">
                {formatCurrency(totalCommitted)}
              </span>
            ),
          },
          {
            label: "Solde disponible",
            value: (
              <span className="font-mono font-semibold text-wwf-700">
                {formatCurrency(totalAllocated - totalUsed)}
              </span>
            ),
          },
          {
            label: "Lignes suivies",
            value: budgetLines.length,
          },
          {
            label: "Projets",
            value: projects.length,
          },
        ]}
      />

      <div className="mt-8">
        <PdfSectionTitle>Détail par ligne</PdfSectionTitle>
        <div className="overflow-hidden rounded-sm border border-ink-300 bg-white">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gradient-to-b from-ink-100 to-ink-50/40 text-left text-[9.5px] uppercase tracking-wider text-ink-700">
                <th className="px-3 py-2 font-semibold">Ligne</th>
                <th className="px-3 py-2 font-semibold">Projet</th>
                <th className="px-3 py-2 text-right font-semibold">Alloué</th>
                <th className="px-3 py-2 text-right font-semibold">Engagé</th>
                <th className="px-3 py-2 text-right font-semibold">Dépensé</th>
                <th className="px-3 py-2 text-right font-semibold">Reste</th>
                <th className="px-3 py-2 text-right font-semibold">%</th>
              </tr>
            </thead>
            <tbody>
              {budgetLines.map((b, i) => {
                const used = b.spentAmount + b.committedAmount;
                const pct = (used / b.allocatedBudget) * 100;
                return (
                  <tr
                    key={b.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-ink-50/30"}
                  >
                    <td className="border-t border-ink-200 px-3 py-2">
                      <div className="font-mono text-[10.5px] text-ink-500">
                        {b.code}
                      </div>
                      <div className="text-ink-800">{b.label}</div>
                    </td>
                    <td className="border-t border-ink-200 px-3 py-2 text-ink-600">
                      {b.project.projectCode}
                    </td>
                    <td className="border-t border-ink-200 px-3 py-2 text-right font-mono">
                      {formatCurrency(b.allocatedBudget, b.currency)}
                    </td>
                    <td className="border-t border-ink-200 px-3 py-2 text-right font-mono">
                      {formatCurrency(b.committedAmount, b.currency)}
                    </td>
                    <td className="border-t border-ink-200 px-3 py-2 text-right font-mono">
                      {formatCurrency(b.spentAmount, b.currency)}
                    </td>
                    <td
                      className={`border-t border-ink-200 px-3 py-2 text-right font-mono ${
                        b.allocatedBudget - used < 0
                          ? "font-semibold text-rose-600"
                          : "text-ink-700"
                      }`}
                    >
                      {formatCurrency(b.allocatedBudget - used, b.currency)}
                    </td>
                    <td
                      className={`border-t border-ink-200 px-3 py-2 text-right font-mono ${
                        pct > 100
                          ? "font-semibold text-rose-600"
                          : pct > 80
                            ? "text-amber-700"
                            : "text-ink-700"
                      }`}
                    >
                      {pct.toFixed(0)} %
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-sm border border-gold-300/70 bg-gold-50/50 p-4 text-[11px] text-ink-800">
        <strong>Note de l&apos;Approbateur Finance :</strong> les chiffres
        ci-dessus reflètent l&apos;état du système au moment de l&apos;édition
        et peuvent évoluer suite aux décisions en cours. Les lignes au
        dépassement (&gt; 100 %) doivent faire l&apos;objet d&apos;une
        réallocation immédiate.
      </div>

      <PdfSignatureBlock
        signatures={[
          { role: "Approbateur Finance", line: "Signature & cachet" },
          { role: "Contrôleur de Gestion", line: "Visa de cohérence" },
          { role: "Direction Nationale", line: "Pour information" },
        ]}
      />

      <div className="mt-10 flex items-center justify-between border-t border-ink-200 pt-3 text-[9.5px] text-ink-500">
        <span>
          État édité le {formatDate(generated)} · {budgetLines.length} lignes
          suivies
        </span>
        <span>Page 1 / 1</span>
      </div>
    </PrintShell>
  );
}
