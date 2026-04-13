// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import type { RiskLevel, TransactionStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Amount formatting ─────────────────────────────────────────────────────────

export function formatAmount(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000)   return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatAmountFull(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Risk level styling ────────────────────────────────────────────────────────

export const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  CRITICAL: {
    label:  "Critical",
    bg:     "bg-red-50",
    text:   "text-red-800",
    dot:    "bg-red-600",
    border: "border-red-200",
  },
  HIGH: {
    label:  "High",
    bg:     "bg-amber-50",
    text:   "text-amber-800",
    dot:    "bg-amber-500",
    border: "border-amber-200",
  },
  MEDIUM: {
    label:  "Medium",
    bg:     "bg-blue-50",
    text:   "text-blue-800",
    dot:    "bg-blue-500",
    border: "border-blue-200",
  },
  LOW: {
    label:  "Low",
    bg:     "bg-green-50",
    text:   "text-green-800",
    dot:    "bg-green-500",
    border: "border-green-200",
  },
};

export const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING:    { label: "Pending",    bg: "bg-gray-100",   text: "text-gray-600" },
  PROCESSING: { label: "Processing", bg: "bg-blue-50",    text: "text-blue-700" },
  SCORED:     { label: "Scored",     bg: "bg-green-50",   text: "text-green-700" },
  FLAGGED:    { label: "Flagged",    bg: "bg-red-50",     text: "text-red-700" },
  CLEARED:    { label: "Cleared",    bg: "bg-emerald-50", text: "text-emerald-700" },
  FAILED:     { label: "Failed",     bg: "bg-gray-100",   text: "text-gray-500" },
};

// ── Date / time formatting ────────────────────────────────────────────────────

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// ── Score bar colour ──────────────────────────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 90) return "#dc2626";
  if (score >= 70) return "#f59e0b";
  if (score >= 40) return "#3b82f6";
  return "#16a34a";
}

// ── Truncate VPA ──────────────────────────────────────────────────────────────

export function truncateVpa(vpa: string, max = 20): string {
  return vpa.length > max ? vpa.slice(0, max) + "…" : vpa;
}