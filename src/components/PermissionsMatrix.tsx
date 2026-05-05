import { Check, Lock, Minus } from "lucide-react";
import {
  getPermissionMatrix,
  ROLE_DISPLAY,
  ROLE_ORDER,
  type MatrixRow,
} from "@/lib/permissions";
import { cn } from "@/lib/cn";

export function PermissionsMatrix() {
  const rows = getPermissionMatrix();
  // Group rows by entity for visual grouping.
  const grouped = rows.reduce<Record<string, MatrixRow[]>>((acc, r) => {
    (acc[r.entityLabel] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-200">
      <table className="w-full text-sm">
        <thead className="bg-ink-50">
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500">
            <th className="px-4 py-2.5 font-medium">Entité</th>
            <th className="px-4 py-2.5 font-medium">Action</th>
            {ROLE_ORDER.map((role) => (
              <th
                key={role}
                className="px-3 py-2.5 text-center font-medium"
              >
                {ROLE_DISPLAY[role]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([label, items]) =>
            items.map((row, idx) => (
              <tr
                key={`${row.entity}-${row.action}`}
                className={cn(
                  "border-t border-ink-100 align-top",
                  idx === 0 ? "bg-ink-50/40" : "",
                )}
              >
                <td className="px-4 py-2 font-medium text-ink-800">
                  {idx === 0 ? label : ""}
                </td>
                <td className="px-4 py-2 text-ink-700">
                  {row.actionLabel}
                  {row.appendOnly ? (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600">
                      <Lock className="h-3 w-3" />
                      append-only
                    </span>
                  ) : null}
                </td>
                {row.cells.map((c) => (
                  <td
                    key={c.role}
                    className="px-3 py-2 text-center align-middle"
                  >
                    {c.verdict.kind === "yes" ? (
                      <span
                        title="Autorisé"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    ) : c.verdict.kind === "conditional" ? (
                      <span
                        title="Sous condition"
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-100"
                      >
                        <Check className="h-3 w-3" />
                        {c.verdict.note}
                      </span>
                    ) : (
                      <span
                        title="Non autorisé"
                        className="inline-flex h-6 w-6 items-center justify-center text-ink-300"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
