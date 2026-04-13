// src/components/ui/RiskBadge.tsx
import { cn, RISK_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import type { RiskLevel, TransactionStatus } from "@/types";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const c = RISK_CONFIG[level];
  return (
    <span
      className={cn(
        "risk-badge",
        c.bg,
        c.text
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        c.bg,
        c.text
      )}
    >
      {c.label}
    </span>
  );
}