import { Award, Trophy } from "lucide-react";
import { Badge } from "./Badge";
import { Card, CardBody, CardHeader } from "./Card";
import { formatCurrency, formatDate } from "@/lib/format";

type Quote = {
  id: string;
  amount: number;
  currency: string;
  leadTimeDays: number | null;
  paymentTerms: string | null;
  technicalScore: number;
  notes: string | null;
  isWinner: boolean;
  receivedAt: Date;
  supplier: { id: string; companyName: string };
};

export function QuoteAnalysis({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) return null;
  const minPrice = Math.min(...quotes.map((q) => q.amount));
  const maxScore = Math.max(...quotes.map((q) => q.technicalScore));
  return (
    <Card>
      <CardHeader
        title="Analyse comparative des offres"
        description="TDR §4.4 — comparaison technique et financière"
        action={
          <span className="inline-flex items-center gap-1 rounded-full bg-wwf-50 px-2.5 py-0.5 text-[11px] font-medium text-wwf-700 ring-1 ring-wwf-100">
            <Trophy className="h-3 w-3" />
            {quotes.length} offre{quotes.length > 1 ? "s" : ""} reçue
            {quotes.length > 1 ? "s" : ""}
          </span>
        }
      />
      <CardBody className="px-0 py-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                <th className="px-5 py-2.5 font-medium">Fournisseur</th>
                <th className="px-5 py-2.5 font-medium text-right">Montant</th>
                <th className="px-5 py-2.5 font-medium text-right">Délai</th>
                <th className="px-5 py-2.5 font-medium">Paiement</th>
                <th className="px-5 py-2.5 font-medium text-right">Score tech.</th>
                <th className="px-5 py-2.5 font-medium">Décision</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const cheapest = q.amount === minPrice;
                const bestScore = q.technicalScore === maxScore;
                return (
                  <tr
                    key={q.id}
                    className={`border-b border-ink-50 last:border-none ${q.isWinner ? "bg-wwf-50/40" : ""}`}
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        {q.isWinner ? (
                          <Award className="h-3.5 w-3.5 text-wwf-700" />
                        ) : null}
                        <span
                          className={`font-medium ${q.isWinner ? "text-wwf-800" : "text-ink-800"}`}
                        >
                          {q.supplier.companyName}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-500">
                        Reçue le {formatDate(q.receivedAt)}
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono">
                      <span className="font-medium text-ink-900">
                        {formatCurrency(q.amount, q.currency)}
                      </span>
                      {cheapest ? (
                        <span className="ml-1.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                          mieux-disant
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {q.leadTimeDays ? `${q.leadTimeDays} j` : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-ink-600">
                      {q.paymentTerms ?? "—"}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-medium text-ink-900">
                          {q.technicalScore}/100
                        </span>
                        {bestScore ? (
                          <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-100">
                            top score
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full bg-wwf-500"
                          style={{ width: `${q.technicalScore}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      {q.isWinner ? (
                        <Badge className="bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                          Retenu
                        </Badge>
                      ) : (
                        <Badge className="bg-ink-100 text-ink-600 ring-1 ring-ink-200">
                          Non retenu
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {quotes.some((q) => q.notes) ? (
          <div className="border-t border-ink-100 px-5 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
              Justification du choix
            </div>
            <ul className="mt-2 space-y-1 text-xs text-ink-700">
              {quotes
                .filter((q) => q.notes)
                .map((q) => (
                  <li key={q.id}>
                    <span className="font-medium text-ink-800">
                      {q.supplier.companyName} :
                    </span>{" "}
                    {q.notes}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
