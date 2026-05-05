import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  await requireUser();
  const budgetLines = await prisma.budgetLine.findMany({
    include: { project: true },
  });
  const rows = budgetLines.map((b) => {
    const used = b.spentAmount + b.committedAmount;
    return [
      b.code,
      b.label,
      b.project.projectCode,
      b.project.name,
      b.allocatedBudget,
      b.committedAmount,
      b.spentAmount,
      used,
      b.allocatedBudget - used,
      ((used / b.allocatedBudget) * 100).toFixed(1),
      b.currency,
    ];
  });
  const csv = toCsv(
    [
      "Ligne",
      "Libellé",
      "Code projet",
      "Projet",
      "Alloué",
      "Engagé",
      "Dépensé",
      "Utilisé",
      "Reste",
      "Consommation %",
      "Devise",
    ],
    rows,
  );
  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(`budget_${today}.csv`, csv);
}
