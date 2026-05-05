"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function TypeBars({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 8, left: -8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#eef0f4" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#6b748a" }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
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
            formatter={(v: number) => [
              `$${v.toLocaleString("fr-FR")}`,
              "Valeur",
            ]}
          />
          <Bar
            dataKey="value"
            fill="#3f8b4f"
            radius={[6, 6, 0, 0]}
            barSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
