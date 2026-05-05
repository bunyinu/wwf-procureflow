"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export function CycleSparkline({
  data,
}: {
  data: { week: string; days: number }[];
}) {
  return (
    <div className="h-[120px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="cycleFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f8b4f" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3f8b4f" stopOpacity="0" />
            </linearGradient>
          </defs>
          <XAxis dataKey="week" hide />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v.toFixed(1)} j`, "Cycle moyen"]}
          />
          <Area
            type="monotone"
            dataKey="days"
            stroke="#3f8b4f"
            strokeWidth={2}
            fill="url(#cycleFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
