"use client";
// src/app/analytics/page.tsx
import { useEffect, useState } from "react";
import { getStats } from "@/lib/api";
import { formatAmount } from "@/lib/utils";
import { HourlyChart } from "@/components/charts/HourlyChart";
import { RiskDonut }   from "@/components/charts/RiskDonut";
import type { DashboardStats } from "@/types";

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Loading analytics…
      </div>
    );
  }

  const dist    = stats?.riskDistribution ?? { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const total   = Object.values(dist).reduce((a, b) => a + b, 0);
  const flagged = (dist.HIGH ?? 0) + (dist.CRITICAL ?? 0);
  const flagPct = total ? ((flagged / total) * 100).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-4">

      {/* Summary metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Total transactions",  value: total.toLocaleString() },
          { label: "Flag rate",           value: `${flagPct}%` },
          { label: "Amount at risk",      value: formatAmount(stats?.totalAmountFlagged ?? 0) },
          { label: "Critical incidents",  value: (dist.CRITICAL ?? 0).toLocaleString() },
        ].map((m) => (
          <div key={m.label} className="card text-center py-5">
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Hourly chart */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-800 mb-4">
          Transaction volume by hour
        </p>
        <HourlyChart data={stats?.hourlyVolume ?? []} />
      </div>

      {/* Donut + top senders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="card">
          <p className="text-sm font-semibold text-gray-800 mb-4">
            Risk level distribution
          </p>
          <RiskDonut distribution={dist} />
        </div>

        <div className="card">
          <p className="text-sm font-semibold text-gray-800 mb-4">
            Top 5 flagged senders
          </p>
          {(stats?.topFlaggedSenders ?? []).length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              No flagged senders yet
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">Sender VPA</th>
                  <th className="table-th text-right">Flags</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.topFlaggedSenders ?? []).map((s, i) => (
                  <tr key={s.senderId}>
                    <td className="table-td text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-td text-xs font-medium">{s.senderId}</td>
                    <td className="table-td text-right">
                      <span className="text-xs font-bold text-red-600 tabular-nums">
                        {s.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}