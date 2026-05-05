// TDR §4.3 — suivi des délais par étape + identification des retards.
// We compute time-in-stage from the audit trail of approvals + creation.

import type { Role, RequisitionStatus } from "@/lib/enums";
import { nextRoleForStatus } from "@/lib/workflow";

export type StageTiming = {
  stage: RequisitionStatus;
  enteredAt: Date;
  exitedAt: Date | null; // null if still in this stage
  durationMs: number;
  slaDays: number;
  overdue: boolean;
};

export type ApprovalLike = {
  decidedAt: Date;
  oldStatus: string;
  newStatus: string;
};

const DEFAULT_SLA_DAYS: Partial<Record<RequisitionStatus, number>> = {
  HIERARCHICAL_REVIEW: 2,
  PROCUREMENT_REVIEW: 3,
  THRESHOLD_REVIEW: 2,
};

export function computeStageTimings(input: {
  submittedAt: Date | null;
  createdAt: Date;
  status: string;
  approvals: ApprovalLike[];
  slaDays?: Partial<Record<RequisitionStatus, number>>;
  now?: Date;
}): StageTiming[] {
  const now = input.now ?? new Date();
  const slaTable = { ...DEFAULT_SLA_DAYS, ...(input.slaDays ?? {}) };
  const stages: StageTiming[] = [];

  // Submission "stage" — from creation until first submitted timestamp
  // (only if the requisition has been submitted at least once).
  if (input.submittedAt) {
    stages.push(buildStage(
      "SUBMITTED" as RequisitionStatus,
      input.createdAt,
      input.submittedAt,
      slaTable,
    ));
  }

  // Sort approvals chronologically
  const sorted = [...input.approvals].sort(
    (a, b) => a.decidedAt.getTime() - b.decidedAt.getTime(),
  );
  let cursor = input.submittedAt ?? input.createdAt;
  for (const a of sorted) {
    stages.push(
      buildStage(a.oldStatus as RequisitionStatus, cursor, a.decidedAt, slaTable),
    );
    cursor = a.decidedAt;
  }
  // Final open stage if status is still active and not a final state
  const FINAL = ["CLOSED", "REJECTED", "CANCELLED"];
  if (!FINAL.includes(input.status)) {
    stages.push(
      buildStage(input.status as RequisitionStatus, cursor, null, slaTable, now),
    );
  }
  return stages;
}

function buildStage(
  stage: RequisitionStatus,
  start: Date,
  end: Date | null,
  sla: Partial<Record<RequisitionStatus, number>>,
  now: Date = new Date(),
): StageTiming {
  const stop = end ?? now;
  const durationMs = stop.getTime() - start.getTime();
  const slaDays = sla[stage] ?? 0;
  const overdue = slaDays > 0 && durationMs > slaDays * 86400_000;
  return {
    stage,
    enteredAt: start,
    exitedAt: end,
    durationMs,
    slaDays,
    overdue,
  };
}

export function formatDuration(ms: number): string {
  if (ms < 60_000) return "<1 min";
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) {
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  }
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh === 0 ? `${d} j` : `${d} j ${rh} h`;
}

export function expectedNextRole(status: string): Role | null {
  return nextRoleForStatus(status as never);
}
