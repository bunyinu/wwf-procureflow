import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { STATUS_LABELS } from "@/lib/workflow";
import { formatDuration, type StageTiming } from "@/lib/sla";
import { formatDate } from "@/lib/format";

export function SlaPanel({ timings }: { timings: StageTiming[] }) {
  if (timings.length === 0) return null;
  return (
    <div className="space-y-2">
      {timings.map((t, i) => {
        const open = t.exitedAt === null;
        return (
          <div
            key={`${t.stage}-${i}`}
            className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2.5 ${
              t.overdue
                ? "border-amber-200 bg-amber-50/60"
                : open
                  ? "border-wwf-200 bg-wwf-50/40"
                  : "border-ink-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ring-1 ${
                  t.overdue
                    ? "bg-amber-100 text-amber-700 ring-amber-200"
                    : open
                      ? "bg-wwf-100 text-wwf-700 ring-wwf-200"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                }`}
              >
                {t.overdue ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : open ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
              </span>
              <div>
                <div className="text-sm font-medium text-ink-900">
                  {STATUS_LABELS[t.stage] ?? t.stage}
                </div>
                <div className="text-[11px] text-ink-500">
                  Entrée : {formatDate(t.enteredAt)} ·{" "}
                  {open ? "en cours" : `Sortie : ${formatDate(t.exitedAt!)}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-semibold ${
                  t.overdue
                    ? "text-amber-800"
                    : open
                      ? "text-wwf-800"
                      : "text-ink-800"
                }`}
              >
                {formatDuration(t.durationMs)}
              </div>
              {t.slaDays > 0 ? (
                <div className="text-[11px] text-ink-500">
                  SLA : {t.slaDays} j {t.overdue ? "— dépassé" : ""}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
