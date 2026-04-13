"use client";
// src/components/charts/SignalBreakdown.tsx

interface SignalBreakdownProps {
  signals: { label: string; pct: number }[];
}

const SIGNAL_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#818cf8",
  "#6366f1",
];

export function SignalBreakdown({ signals }: SignalBreakdownProps) {
  return (
    <div className="flex flex-col gap-3">
      {signals.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-28 flex-shrink-0 truncate">
            {s.label}
          </span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:           `${s.pct}%`,
                backgroundColor: SIGNAL_COLORS[i % SIGNAL_COLORS.length],
              }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-8 text-right tabular-nums">
            {s.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}