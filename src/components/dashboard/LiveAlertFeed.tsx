"use client";
// src/components/dashboard/LiveAlertFeed.tsx
import { useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import { cn, formatAmount, timeAgo, RISK_CONFIG } from "@/lib/utils";
import { TransactionDetailsModal } from "@/components/modals/TransactionDetailsModal";
import type { FraudAlert } from "@/types";

interface LiveAlertFeedProps {
  alerts: FraudAlert[];
}

export function LiveAlertFeed({ alerts }: LiveAlertFeedProps) {
  const { markAsReviewed } = useSocket();
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAlertClick = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
    // Auto-mark as reviewed when opened
    markAsReviewed(alert.txnId);
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <AlertTriangle size={20} className="mb-2 opacity-40" />
        <p className="text-xs">No alerts yet — monitoring live</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col divide-y divide-gray-50">
        {alerts.slice(0, 6).map((alert) => {
          const c = RISK_CONFIG[alert.riskLevel];
          return (
            <div
              key={alert.txnId}
              onClick={() => handleAlertClick(alert)}
              className={cn(
                "flex items-start gap-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 -mx-2",
                alerts[0]?.txnId === alert.txnId && "alert-new"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  c.bg
                )}
              >
                <AlertTriangle size={13} className={c.text} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                    {alert.senderId}
                  </span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-xs text-gray-500 truncate max-w-[100px]">
                    {alert.receiverId}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {alert.city} · {timeAgo(alert.scoredAt)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {alert.riskReason}
                </p>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={cn("text-xs font-semibold", c.text)}>
                  {formatAmount(alert.amount)}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                    c.bg,
                    c.text
                  )}
                >
                  {c.label} · {alert.riskScore}
                </span>
              </div>
            </div>
          );
        })}

        {alerts.length > 6 && (
          <div className="pt-3 pb-1">
            <Link
              href="/alerts"
              className="flex items-center gap-1 text-xs text-brand hover:text-indigo-700 transition-colors"
            >
              View all {alerts.length} alerts
              <ExternalLink size={11} />
            </Link>
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