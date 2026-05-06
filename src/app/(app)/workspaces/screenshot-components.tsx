import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ScreenshotWorkspace({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[4px] border border-[#d8e2ef] bg-[#f5f8fb] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="bg-[#062c55] px-4 py-1.5 text-center text-[13px] font-bold uppercase tracking-wide text-white">
        {title}
      </div>
      <div className="space-y-3 p-2.5 sm:p-3">{children}</div>
    </section>
  );
}

export function ShotCard({
  title,
  children,
  className,
  action,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[4px] border border-[#dbe3ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-[#eef2f7] px-3 py-2">
          <h2 className="text-[13px] font-bold leading-none text-[#0f2945]">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className={cn("p-3", !title && "pt-3")}>{children}</div>
    </div>
  );
}

export function Kpi({
  label,
  value,
  tone = "navy",
  note,
}: {
  label: string;
  value: ReactNode;
  tone?: "navy" | "green" | "red" | "orange" | "blue";
  note?: ReactNode;
}) {
  const tones = {
    navy: "text-[#0f2945]",
    green: "text-emerald-600",
    red: "text-red-600",
    orange: "text-orange-500",
    blue: "text-blue-600",
  };
  return (
    <div className="rounded-[4px] border border-[#dbe3ef] bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
        {label} <span className="text-slate-400">•</span>
      </div>
      <div className={cn("mt-2 text-[28px] font-bold leading-none", tones[tone])}>{value}</div>
      {note ? <div className="mt-1 text-[11px] text-slate-500">{note}</div> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "green" | "blue" | "orange" | "red" | "gray";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span className={cn("inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-semibold leading-none ring-1", tones[tone])}>
      {children}
    </span>
  );
}

export function ShotTable({
  headers,
  rows,
  compact = false,
}: {
  headers: string[];
  rows: ReactNode[][];
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-[#eef2f7] bg-[#f8fafc] text-[10px] uppercase tracking-wide text-slate-500">
            {headers.map((header) => (
              <th key={header} className={cn("font-bold", compact ? "px-2 py-1.5" : "px-3 py-2")}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-[#f1f5f9] last:border-none hover:bg-[#f8fafc]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cn("align-top text-slate-700", compact ? "px-2 py-1.5" : "px-3 py-2")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FieldBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#0f2945]">{label}</label>
      <div className="mt-1 rounded-[4px] border border-[#dbe3ef] bg-white px-3 py-2 text-[12px] text-slate-700">
        {value}
      </div>
    </div>
  );
}

export function StatusStep({
  label,
  meta,
  active,
  done,
}: {
  label: string;
  meta?: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : active
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-400",
        )}
      >
        {done ? "✓" : active ? "●" : ""}
      </div>
      <div>
        <div className={cn("text-[12px] font-semibold", active ? "text-blue-700" : "text-slate-700")}>{label}</div>
        {meta ? <div className="text-[10px] text-slate-500">{meta}</div> : null}
      </div>
    </div>
  );
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "green" | "orange" | "red" }) {
  const tones = {
    blue: "bg-blue-600",
    green: "bg-emerald-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full", tones[tone])} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}

export function ChartDonut({ colors = ["#1f77b4", "#2ca02c", "#ff7f0e"] }: { colors?: string[] }) {
  const gradient = colors.map((color, index) => `${color} ${index * (100 / colors.length)}% ${(index + 1) * (100 / colors.length)}%`).join(", ");
  return (
    <div className="mx-auto h-32 w-32 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
      <div className="flex h-full w-full items-center justify-center rounded-full p-5">
        <div className="h-full w-full rounded-full bg-white" />
      </div>
    </div>
  );
}
