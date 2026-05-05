import { Badge } from "./Badge";
import { STATUS_BADGE, STATUS_LABELS } from "@/lib/workflow";
import type { RequisitionStatus } from "@/lib/enums";

export function StatusBadge({ status }: { status: string }) {
  const s = status as RequisitionStatus;
  return <Badge className={STATUS_BADGE[s] ?? ""}>{STATUS_LABELS[s] ?? s}</Badge>;
}
