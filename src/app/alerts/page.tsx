"use client";
// src/app/alerts/page.tsx
import { useState } from "react";
import { AlertTriangle, Trash2, Wifi, WifiOff } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { cn, formatAmount, formatDateTime, RISK_CONFIG } from "@/lib/utils";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { TransactionDetailsModal } from "@/components/modals/TransactionDetailsModal";
import type { FraudAlert } from "@/types";

type FilterTab = "unreviewed" | "all";

function AlertRow({
  alert,
  isNew,
  isReviewed,
  onClick,
  onMark,
}: {
  alert: FraudAlert;
  isNew: boolean;
  isReviewed: boolean;
  onClick: () => void;
  onMark: (e: React.MouseEvent) => void;
}) {
  const c = RISK_CONFIG[alert.riskLevel];
  return (
    <div
      onClick={onClick}
      className={cn(
        "card flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-shadow hover:border-brand/20",
        isNew && "alert-new",
        isReviewed && "opacity-60 hover:opacity-80",
        alert.riskLevel === "CRITICAL" && "border-l-4 border-l-red-500",
        alert.riskLevel === "HIGH" && "border-l-4 border-l-amber-400"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
              c.bg
            )}
          >
            <AlertTriangle size={15} className={c.text} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  c.bg,
                  c.text
                )}
              >
                {c.label}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {alert.txnId.slice(-10)}
              </span>
              {isReviewed && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Reviewed
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {formatDateTime(alert.scoredAt)} · {alert.city}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={cn("text-base font-bold tabular-nums", c.text)}>
            {formatAmount(alert.amount)}
          </p>
          <p className="text-[11px] text-gray-400">
            {(alert.amount / 100).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </p>
        </div>
      </div>

      {/* VPA row */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 mb-0.5">Sender</p>
          <p className="text-xs font-medium text-gray-800 truncate">
            {alert.senderId}
          </p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 mb-0.5">Receiver</p>
          <p className="text-xs font-medium text-gray-800 truncate">
            {alert.receiverId}
          </p>
        </div>
      </div>

      {/* Score + reason */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 mb-1">Risk score</p>
          <ScoreBar score={alert.riskScore} />
        </div>
        <div className="flex-[2] min-w-0">
          <p className="text-[10px] text-gray-400 mb-1">Reason</p>
          <p className="text-xs text-gray-600 truncate">{alert.riskReason}</p>
        </div>
      </div>

      {/* Signals */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(alert.fraudSignals || {})
          .filter(([, v]) => v === true)
          .map(([k]) => (
            <span
              key={k}
              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
            >
              {k.replace(/_/g, " ")}
            </span>
          ))}
      </div>

      {/* Mark as reviewed button */}
      {!isReviewed && (
        <button
          onClick={onMark}
          className="text-xs text-center py-1.5 px-3 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg transition-colors"
        >
          Mark as Reviewed
        </button>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, unreviewed, isConnected, reviewedAlerts, markAsReviewed } =
    useSocket();
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("unreviewed");
  const [refreshKey, setRefreshKey] = useState(0);

  const displayAlerts = filter === "unreviewed" ? unreviewed : alerts;
  const critical = displayAlerts.filter((a) => a.riskLevel === "CRITICAL");
  const high = displayAlerts.filter((a) => a.riskLevel === "HIGH");

  const handleAlertClick = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
    // Auto-mark as reviewed when opened
    markAsReviewed(alert.txnId);
  };

  const handleMarkAsReviewed = (
    e: React.MouseEvent,
    alert: FraudAlert
  ) => {
    e.stopPropagation();
    markAsReviewed(alert.txnId);
    // Force a refresh of the component to reflect the change
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header bar with filters */}
        <div className="card flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                isConnected
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {isConnected ? (
                <>
                  <Wifi size={12} className="live-dot" /> Live feed
                </>
              ) : (
                <>
                  <WifiOff size={12} /> Disconnected
                </>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter("unreviewed")}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded transition-colors",
                  filter === "unreviewed"
                    ? "bg-white text-brand shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Unreviewed ({unreviewed.length})
              </button>
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded transition-colors",
                  filter === "all"
                    ? "bg-white text-brand shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                All Alerts ({alerts.length})
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-3">
            {critical.length > 0 && (
              <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {critical.length} critical
              </span>
            )}
            {high.length > 0 && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {high.length} high
              </span>
            )}
          </div>
        </div>

        {/* Alert list */}
        {displayAlerts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <AlertTriangle size={20} className="opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                {filter === "unreviewed"
                  ? "All caught up!"
                  : "Monitoring for alerts"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {filter === "unreviewed"
                  ? "No unreviewed alerts at the moment"
                  : "HIGH and CRITICAL transactions will appear here in real-time"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {displayAlerts.map((alert) => (
              <AlertRow
                key={alert.txnId}
                alert={alert}
                isNew={displayAlerts[0]?.txnId === alert.txnId && filter === "unreviewed"}
                isReviewed={reviewedAlerts.has(alert.txnId)}
                onClick={() => handleAlertClick(alert)}
                onMark={(e) => handleMarkAsReviewed(e, alert)}
              />
            ))}
          </div>
        )}
      </div>

      <TransactionDetailsModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}