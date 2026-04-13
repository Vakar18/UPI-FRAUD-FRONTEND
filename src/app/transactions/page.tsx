"use client";
// src/app/transactions/page.tsx
import { useEffect, useState, useCallback } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { getTransactions, clearTransaction } from "@/lib/api";
import {
  formatAmount,
  formatDateTime,
  truncateVpa,
  cn,
} from "@/lib/utils";
import { RiskBadge, StatusBadge } from "@/components/ui/RiskBadge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import type { Transaction, TransactionQuery, RiskLevel, TransactionStatus } from "@/types";

const RISK_OPTS: { label: string; value: string }[] = [
  { label: "All risk levels", value: "" },
  { label: "Critical",  value: "CRITICAL" },
  { label: "High",      value: "HIGH" },
  { label: "Medium",    value: "MEDIUM" },
  { label: "Low",       value: "LOW" },
];

const STATUS_OPTS: { label: string; value: string }[] = [
  { label: "All statuses", value: "" },
  { label: "Flagged",    value: "FLAGGED" },
  { label: "Scored",     value: "SCORED" },
  { label: "Pending",    value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Cleared",    value: "CLEARED" },
];

export default function TransactionsPage() {
  const [txns,    setTxns]    = useState<Transaction[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<string | null>(null);

  const [query, setQuery] = useState<TransactionQuery>({
    page:      1,
    limit:     20,
    sortBy:    "createdAt",
    sortOrder: "desc",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions(query);
      setTxns(res.data);
      setTotal(res.total);
      setPages(res.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  function setFilter(patch: Partial<TransactionQuery>) {
    setQuery((q) => ({ ...q, ...patch, page: 1 }));
  }

  async function handleClear(txnId: string) {
    setClearing(txnId);
    try {
      const updated = await clearTransaction(txnId);
      setTxns((prev) =>
        prev.map((t) => (t.txnId === txnId ? updated : t))
      );
    } finally {
      setClearing(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Sender VPA…"
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
            onChange={(e) => setFilter({ senderId: e.target.value || undefined })}
          />
        </div>

        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none"
          onChange={(e) =>
            setFilter({ riskLevel: (e.target.value as RiskLevel) || undefined })
          }
        >
          {RISK_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none"
          onChange={(e) =>
            setFilter({ status: (e.target.value as TransactionStatus) || undefined })
          }
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="text-xs text-gray-400 ml-auto">
          {total.toLocaleString()} results
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-th px-4 py-3">Txn ID</th>
                <th className="table-th px-4 py-3">Sender</th>
                <th className="table-th px-4 py-3">Receiver</th>
                <th className="table-th px-4 py-3">Amount</th>
                <th className="table-th px-4 py-3">City</th>
                <th className="table-th px-4 py-3">Score</th>
                <th className="table-th px-4 py-3">Risk</th>
                <th className="table-th px-4 py-3">Status</th>
                <th className="table-th px-4 py-3">Time</th>
                <th className="table-th px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : txns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-sm text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                txns.map((t) => (
                  <tr
                    key={t.txnId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="table-td px-4">
                      <span className="font-mono text-[11px] text-gray-500">
                        {t.txnId.slice(-8)}
                      </span>
                    </td>
                    <td className="table-td px-4">
                      <span className="text-xs">{truncateVpa(t.senderId, 18)}</span>
                    </td>
                    <td className="table-td px-4">
                      <span className="text-xs text-gray-500">
                        {truncateVpa(t.receiverId, 18)}
                      </span>
                    </td>
                    <td className="table-td px-4">
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums",
                          t.riskLevel === "CRITICAL" || t.riskLevel === "HIGH"
                            ? "text-red-600"
                            : "text-gray-800"
                        )}
                      >
                        {formatAmount(t.amount)}
                      </span>
                    </td>
                    <td className="table-td px-4">
                      <span className="text-xs text-gray-500">{t.city}</span>
                    </td>
                    <td className="table-td px-4 w-28">
                      {t.riskScore != null ? (
                        <ScoreBar score={t.riskScore} />
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="table-td px-4">
                      {t.riskLevel ? (
                        <RiskBadge level={t.riskLevel} />
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="table-td px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="table-td px-4">
                      <span className="text-[11px] text-gray-400">
                        {formatDateTime(t.transactionTime)}
                      </span>
                    </td>
                    <td className="table-td px-4">
                      {t.status === "FLAGGED" && (
                        <button
                          onClick={() => handleClear(t.txnId)}
                          disabled={clearing === t.txnId}
                          className="flex items-center gap-1 text-[11px] text-green-700 hover:text-green-800 disabled:opacity-50"
                        >
                          <CheckCircle2 size={12} />
                          {clearing === t.txnId ? "…" : "Clear"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Page {query.page} of {pages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={(query.page ?? 1) <= 1}
              onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
              className="btn-ghost py-1 px-2 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={(query.page ?? 1) >= pages}
              onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
              className="btn-ghost py-1 px-2 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}