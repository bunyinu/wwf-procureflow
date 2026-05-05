import { Badge } from "./Badge";
import { PRIORITY_BADGE, PRIORITY_LABEL, type Priority } from "@/lib/enums";

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority as Priority;
  return (
    <Badge className={PRIORITY_BADGE[p] ?? ""}>
      {PRIORITY_LABEL[p] ?? priority}
    </Badge>
  );
}
