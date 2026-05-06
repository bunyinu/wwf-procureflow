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
    <div className="flex flex-col items-center gap-3 rounded-[4px] border border-dashed border-[#cfd9e8] bg-white px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-blue-50 text-blue-700 ring-1 ring-blue-100">
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-sm font-bold text-[#0f2945]">{title}</div>
      {description ? <p className="max-w-md text-xs leading-5 text-slate-500">{description}</p> : null}
      {action}
    </div>
  );
}
