"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PALETTE: Record<string, string> = {
  DRAFT: "#94a3b8",
  SUBMITTED: "#3b82f6",
  MANAGER_REVIEW: "#f59e0b",
  PROCUREMENT_REVIEW: "#a855f7",
  FINANCE_REVIEW: "#fb923c",
  PO_CREATED: "#6366f1",
  RECEIVED: "#14b8a6",
  CLOSED: "#10b981",
  REJECTED: "#ef4444",
  RETURNED_FOR_REVISION: "#facc15",
  CANCELLED: "#71717a",
};

export function StatusDonut({
  data,
}: {
  data: { name: string; label: string; value: number }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={PALETTE[d.name] ?? "#a1a1aa"} />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(v: number, n: string) => [`${v} dossiers`, n]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold tracking-tight text-ink-900">
          {total}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-ink-500">
          Réquisitions
        </div>
      </div>
    </div>
  );
}
