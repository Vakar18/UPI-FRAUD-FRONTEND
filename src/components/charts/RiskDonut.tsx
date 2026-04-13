"use client";
// src/components/charts/RiskDonut.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { RiskLevel } from "@/types";
import { RISK_CONFIG } from "@/lib/utils";

const COLORS: Record<RiskLevel, string> = {
  CRITICAL: "#dc2626",
  HIGH:     "#f59e0b",
  MEDIUM:   "#3b82f6",
  LOW:      "#16a34a",
};

interface RiskDonutProps {
  distribution: Record<RiskLevel, number>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-medium" style={{ color: payload[0].payload.color }}>
        {payload[0].name}: {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

export function RiskDonut({ distribution }: RiskDonutProps) {
  const data = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as RiskLevel[]).map(
    (level) => ({
      name:  RISK_CONFIG[level].label,
      value: distribution[level] ?? 0,
      color: COLORS[level],
    })
  );

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-28 h-28 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={52}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold text-gray-900">
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] text-gray-400">total</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-gray-600 flex-1">{d.name}</span>
            <span className="text-xs font-medium text-gray-900 tabular-nums">
              {d.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}