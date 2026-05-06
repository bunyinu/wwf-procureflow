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
      ? "text-amber-700"
      : tone === "good"
        ? "text-wwf-700"
        : tone === "muted"
          ? "text-ink-500"
          : tone === "brand"
            ? "text-wwf-800"
            : "text-ink-900";
  const iconBg =
    tone === "warn"
      ? "bg-amber-50 text-amber-600 ring-amber-100"
      : tone === "good" || tone === "brand"
        ? "bg-wwf-50 text-wwf-700 ring-wwf-100"
        : "bg-ink-50 text-ink-500 ring-ink-100";

  return (
    <div className="executive-panel lift group relative overflow-hidden rounded-2xl p-5">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, rgba(46,109,60,0.65), rgba(180,133,51,0.45), transparent)",
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-500">
          {label}
        </span>
        {Icon ? (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl ring-1",
              iconBg,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-3 text-[30px] font-semibold leading-none tracking-tight",
          toneClass,
        )}
      >
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {hint ? <span className="text-ink-500">{hint}</span> : null}
        {trend ? (
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-700"
                : trend.direction === "down"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-ink-100 text-ink-600",
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
