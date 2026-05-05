import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Stat } from "@/components/Stat";
import { CashFlowBars } from "@/components/charts/CashFlowBars";
import { formatCurrency } from "@/lib/format";
import { CircleDollarSign, TrendingUp, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

const MONTHS_FR = [
  "Janv",
  "Févr",
  "Mars",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

export default async function FinanceCashflowPage() {
  await requireUser();
  const requisitions = await prisma.purchaseRequisition.findMany({
    where: { status: { not: "CANCELLED" }, submittedAt: { not: null } },
    include: { project: true },
  });

  // Build a 6-month rolling window (current month back 5).
  const now = new Date();
  const buckets = new Map<
    string,
    { month: string; engaged: number; spent: number }
  >();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, {
      month: `${MONTHS_FR[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
      engaged: 0,
      spent: 0,
    });
  }

  for (const r of requisitions) {
    if (!r.submittedAt) continue;
    const d = r.submittedAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (
      r.status === "RECEIVED" ||
      r.status === "CLOSED"
    ) {
      bucket.spent += r.amount;
    } else if (
      [
        "MANAGER_REVIEW",
        "PROCUREMENT_REVIEW",
        "FINANCE_REVIEW",
        "PO_CREATED",
      ].includes(r.status)
    ) {
      bucket.engaged += r.amount;
    }
  }

  const data = Array.from(buckets.values());
  const totalEngaged = data.reduce((s, d) => s + d.engaged, 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-700">
          Espace Finance
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
          Cash-flow des engagements
        </h1>
        <p className="text-sm text-ink-500">
          Engagements et dépenses consolidés sur les six derniers mois.
          Permet d&apos;anticiper les pics de trésorerie liés au cycle
          d&apos;achat.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total engagé (6 mois)"
          value={formatCurrency(totalEngaged)}
          hint="Dossiers en cours d'approbation ou de PO"
          icon={Wallet}
          tone="warn"
        />
        <Stat
          label="Total dépensé (6 mois)"
          value={formatCurrency(totalSpent)}
          hint="Réceptionné ou clôturé"
          icon={CircleDollarSign}
          tone="good"
        />
        <Stat
          label="Volume total cycle"
          value={formatCurrency(totalEngaged + totalSpent)}
          hint="Engagement + dépense"
          icon={TrendingUp}
          tone="brand"
        />
      </div>

      <Card>
        <CardHeader
          title="Cash-flow mensuel"
          description="Empilé : Dépensé (vert) + Engagé (or)"
        />
        <CardBody>
          <CashFlowBars data={data} />
        </CardBody>
      </Card>

      <div className="rounded-lg border border-dashed border-wwf-200 bg-wwf-50/40 px-4 py-3 text-xs text-wwf-900">
        <strong>Lecture :</strong> les barres or représentent les engagements
        (validés mais non encore réceptionnés), les barres vertes les
        dépenses (biens/services réceptionnés). Un mois fortement engagé
        annonce un pic de paiement dans les semaines suivantes.
      </div>
    </div>
  );
}
