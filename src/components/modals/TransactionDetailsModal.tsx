"use client";
// src/components/modals/TransactionDetailsModal.tsx
import { X, AlertTriangle, DollarSign, User, MapPin, Clock, CheckCircle2, Copy } from "lucide-react";
import { cn, formatAmount, formatDateTime, RISK_CONFIG } from "@/lib/utils";
import type { FraudAlert } from "@/types";

interface TransactionDetailsModalProps {
  alert: FraudAlert | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsModal({
  alert,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  if (!isOpen || !alert) return null;

  const c = RISK_CONFIG[alert.riskLevel];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={cn("sticky top-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between", c.bg)}>
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
                <AlertTriangle size={20} className={c.text} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", c.text)}>
                  {c.label} - Transaction Details
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Risk Score: {alert.riskScore}/100</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Amount & Risk Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("rounded-xl p-4", c.bg)}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={14} className={c.text} />
                  <p className="text-xs text-gray-500">Transaction Amount</p>
                </div>
                <p className={cn("text-2xl font-bold tabular-nums", c.text)}>
                  {formatAmount(alert.amount)}
                </p>
              </div>
              <div className="rounded-xl p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-2xl font-bold", c.text)}>
                    {alert.riskScore}
                  </span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", c.bg, c.text)}>
                    {c.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction IDs */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Transaction IDs
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">UPI Transaction ID</p>
                    <p className="text-xs font-mono font-medium text-gray-700">{alert.txnId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(alert.txnId)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Parties Section */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Transaction Parties
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-gray-400" />
                    <p className="text-[10px] text-gray-500">Sender (VPA)</p>
                  </div>
                  <p className="text-xs font-mono font-medium text-gray-700 truncate">
                    {alert.senderId}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-gray-400" />
                    <p className="text-[10px] text-gray-500">Receiver (VPA)</p>
                  </div>
                  <p className="text-xs font-mono font-medium text-gray-700 truncate">
                    {alert.receiverId}
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-[10px] text-gray-500">Location</p>
                </div>
                <p className="text-xs font-medium text-gray-700">{alert.city}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-gray-400" />
                  <p className="text-[10px] text-gray-500">Detected At</p>
                </div>
                <p className="text-xs font-mono font-medium text-gray-700">
                  {formatDateTime(alert.scoredAt)}
                </p>
              </div>
            </div>

            {/* Risk Reason */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Risk Assessment
              </p>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-800">{alert.riskReason}</p>
              </div>
            </div>

            {/* Fraud Signals */}
            {alert.fraudSignals && Object.keys(alert.fraudSignals).length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Triggered Signals
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(alert.fraudSignals)
                    .filter(([, v]) => v === true || (typeof v === 'number' && v > 0))
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className={cn(
                          "text-xs font-medium px-2.5 py-1.5 rounded-lg border",
                          value === true
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {key.replace(/_/g, " ").charAt(0).toUpperCase() + key.replace(/_/g, " ").slice(1)}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle2 size={14} className="text-green-600" />
                <span>Transaction verified and logged</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
