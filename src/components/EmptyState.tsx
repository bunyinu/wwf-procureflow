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
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-400 ring-1 ring-ink-200">
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-sm font-medium text-ink-700">{title}</div>
      {description ? (
        <p className="max-w-md text-xs text-ink-500">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
