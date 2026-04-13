"use client";
// src/components/charts/HourlyChart.tsx
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

interface HourlyData {
  hour:    number;
  count:   number;
  flagged: number;
}

function padHours(data: HourlyData[]): HourlyData[] {
  const map = new Map(data.map((d) => [d.hour, d]));
  return Array.from({ length: 24 }, (_, h) =>
    map.get(h) ?? { hour: h, count: 0, flagged: 0 }
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 mb-1">
        {String(label).padStart(2, "0")}:00
      </p>
      <p className="text-indigo-600">Total: {payload[0]?.value ?? 0}</p>
      <p className="text-red-500">Flagged: {payload[1]?.value ?? 0}</p>
    </div>
  );
};

export function HourlyChart({ data }: { data: HourlyData[] }) {
  const padded = padHours(data);

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={padded}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        barSize={10}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickFormatter={(v) => `${String(v).padStart(2, "0")}h`}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="count"   name="Total"   fill="#c7d2fe" radius={[3, 3, 0, 0]} />
        <Bar dataKey="flagged" name="Flagged" fill="#f87171" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}