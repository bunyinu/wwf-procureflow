import { cn } from "@/lib/cn";
import {
  STATUS_LABELS,
  TIMELINE_STEPS,
} from "@/lib/workflow";
import type { RequisitionStatus } from "@/lib/enums";

const ORDER: Record<string, number> = TIMELINE_STEPS.reduce(
  (acc, s, idx) => ({ ...acc, [s]: idx }),
  {},
);

export function WorkflowTimeline({
  current,
}: {
  current: RequisitionStatus | string;
}) {
  const isRejected = current === "REJECTED";
  const isReturned = current === "RETURNED_FOR_REVISION";
  const isCancelled = current === "CANCELLED";
  const offTrack = isRejected || isReturned || isCancelled;
  const currentIdx = ORDER[current as string] ?? -1;

  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {TIMELINE_STEPS.map((step, idx) => {
        const reached = !offTrack && idx <= currentIdx;
        const isCurrent = !offTrack && idx === currentIdx;
        return (
          <li key={step} className="flex items-center">
            <div
              className={cn(
                "flex flex-col items-center gap-1 px-2",
                "min-w-[88px] text-center",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-2",
                  reached
                    ? "bg-wwf-600 text-white ring-wwf-600"
                    : "bg-white text-ink-400 ring-ink-200",
                  isCurrent && "ring-wwf-300 ring-offset-2 ring-offset-white",
                )}
              >
                {idx + 1}
              </span>
              <span
                className={cn(
                  "text-[10.5px] font-medium",
                  reached ? "text-ink-800" : "text-ink-400",
                )}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-0.5 w-8",
                  reached && idx < currentIdx ? "bg-wwf-500" : "bg-ink-200",
                )}
              />
            ) : null}
          </li>
        );
      })}
      {offTrack ? (
        <li className="ml-3 flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
          {isRejected
            ? "Workflow interrompu — Rejetée"
            : isReturned
              ? "Renvoyée pour révision"
              : "Workflow annulé"}
        </li>
      ) : null}
    </ol>
  );
}
