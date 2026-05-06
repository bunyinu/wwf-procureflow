import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
  trend,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "warn" | "good" | "muted" | "brand";
  icon?: LucideIcon;
  trend?: { direction: "up" | "down" | "flat"; label: string };
}) {
  const toneClass =
    tone === "warn"
      ? "text-orange-600"
      : tone === "good"
        ? "text-emerald-600"
        : tone === "muted"
          ? "text-slate-500"
          : tone === "brand"
            ? "text-blue-700"
            : "text-[#0f2945]";
  const iconBg =
    tone === "warn"
      ? "bg-orange-50 text-orange-600 ring-orange-100"
      : tone === "good" || tone === "brand"
        ? "bg-blue-50 text-blue-700 ring-blue-100"
        : "bg-slate-50 text-slate-500 ring-slate-100";

  return (
    <div className="rounded-[4px] border border-[#dbe3ef] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold text-slate-600">
          {label} <span className="text-slate-400">•</span>
        </span>
        {Icon ? (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-[4px] ring-1", iconBg)}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className={cn("mt-2 text-[28px] font-bold leading-none", toneClass)}>{value}</div>
      <div className="mt-1 flex items-center gap-2 text-[11px]">
        {hint ? <span className="text-slate-500">{hint}</span> : null}
        {trend ? (
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-0.5 rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold",
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-700"
                : trend.direction === "down"
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-100 text-slate-600",
            )}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
            {trend.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
