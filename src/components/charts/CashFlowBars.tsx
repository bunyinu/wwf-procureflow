"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function CashFlowBars({
  data,
}: {
  data: { month: string; engaged: number; spent: number }[];
}) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: -8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#eef0f4" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#6b748a" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b748a" }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(v: number) => `$${v.toLocaleString("fr-FR")}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            name="Dépensé"
            dataKey="spent"
            stackId="cash"
            fill="#3f8b4f"
            radius={[0, 0, 0, 0]}
            barSize={28}
          />
          <Bar
            name="Engagé"
            dataKey="engaged"
            stackId="cash"
            fill="#caa247"
            radius={[6, 6, 0, 0]}
            barSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
