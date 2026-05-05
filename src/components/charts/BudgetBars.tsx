"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function BudgetBars({
  data,
}: {
  data: { code: string; pct: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 24, left: 12, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#eef0f4" />
          <XAxis
            type="number"
            domain={[0, 110]}
            tick={{ fontSize: 11, fill: "#6b748a" }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="code"
            tick={{ fontSize: 11, fill: "#41485b" }}
            width={110}
          />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v.toFixed(0)}%`, "Consommation"]}
          />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((d) => (
              <Cell
                key={d.code}
                fill={d.pct > 100 ? "#ef4444" : d.pct > 80 ? "#f59e0b" : "#3f8b4f"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
