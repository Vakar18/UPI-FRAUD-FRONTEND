"use client";
// src/app/page.tsx
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ShieldX,
  IndianRupee,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { getStats, getFraudSignals } from "@/lib/api";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { StatCard }        from "@/components/ui/StatCard";
import { HourlyChart }     from "@/components/charts/HourlyChart";
import { RiskDonut }       from "@/components/charts/RiskDonut";
import { SignalBreakdown } from "@/components/charts/SignalBreakdown";
import { LiveAlertFeed }   from "@/components/dashboard/LiveAlertFeed";
import { TopSenders }      from "@/components/dashboard/TopSenders";
import type { DashboardStats } from "@/types";

// Static signal labels mapped from backend fraud signal keys
const SIGNAL_LABELS: Record<string, string> = {
  large_amount:      "Large amount",
  very_large_amount: "Very large amount",
  odd_hour:          "Odd hour (1–4 AM)",
  new_recipient:     "New recipient",
  rapid_succession:  "Rapid succession",
  round_number:      "Round number",
};

export default function DashboardPage() {
  const [stats,      setStats]      = useState<DashboardStats | null>(null);
  const [signals,    setSignals]    = useState<{ label: string; pct: number }[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [lastFetch,  setLastFetch]  = useState<Date | null>(null);

  const { unreviewed, stats: liveStats } = useSocket();

  // Use live stats from WebSocket if available, else API stats
  const display = liveStats ?? stats;

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, signalsData] = await Promise.all([
        getStats(),
        getFraudSignals(),
      ]);
      setStats(statsData);
      setSignals(signalsData);
      setLastFetch(new Date());
    } catch {
      // silent — show stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard…
      </div>
    );
  }

  const dist  = display?.riskDistribution ?? { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  const flagged = (dist.HIGH ?? 0) + (dist.CRITICAL ?? 0);

  return (
    <div className="flex flex-col gap-4">

      {/* Refresh row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {lastFetch
            ? `Last fetched ${formatDateTime(lastFetch.toISOString())}`
            : "Fetching…"}
        </p>
        <button
          onClick={fetchStats}
          className="btn-ghost text-xs gap-1.5 py-1 px-2"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Transactions today"
          value={total.toLocaleString()}
          icon={ArrowLeftRight}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          trend="+12%"
          trendUp
        />
        <StatCard
          label="Flagged"
          value={flagged}
          sub={total ? `${((flagged / total) * 100).toFixed(1)}% flag rate` : undefined}
          subColor="text-red-500"
          icon={ShieldX}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          label="Amount at risk"
          value={formatAmount(display?.totalAmountFlagged ?? 0)}
          sub={`across ${flagged} txns`}
          icon={IndianRupee}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Low risk"
          value={(dist.LOW ?? 0).toLocaleString()}
          sub="cleared automatically"
          icon={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Row 2: hourly chart + donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">
              Hourly transaction volume
            </p>
            <span className="text-xs text-gray-400">Last 24 hours</span>
          </div>
          <HourlyChart data={display?.hourlyVolume ?? []} />
        </div>

        <div className="card">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Risk distribution
          </p>
          <RiskDonut distribution={dist} />
        </div>
      </div>

      {/* Row 3: live alerts + signal breakdown + top senders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

        <div className="xl:col-span-1 card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">
              Live fraud alerts
            </p>
            {unreviewed.length > 0 && (
              <a
                href="/alerts"
                className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium hover:bg-red-100 transition-colors cursor-pointer"
              >
                {unreviewed.length} unreviewed
              </a>
            )}
          </div>
          <LiveAlertFeed alerts={unreviewed} />
        </div>

        <div className="card">
          <p className="text-sm font-semibold text-gray-800 mb-4">
            Top fraud signals
          </p>
          <SignalBreakdown signals={signals} />
        </div>

        <div className="card">
          <p className="text-sm font-semibold text-gray-800 mb-4">
            Top flagged senders
          </p>
          <TopSenders senders={display?.topFlaggedSenders ?? []} />
        </div>

      </div>
    </div>
  );
}