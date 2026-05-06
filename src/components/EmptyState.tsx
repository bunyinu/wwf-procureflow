import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200/80 bg-white/58 px-6 py-12 text-center shadow-inner">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      {description ? (
        <p className="max-w-md text-xs leading-5 text-ink-500">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
