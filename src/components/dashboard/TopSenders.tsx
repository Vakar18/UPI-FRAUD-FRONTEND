// src/components/dashboard/TopSenders.tsx
import { cn } from "@/lib/utils";

interface TopSendersProps {
  senders: { senderId: string; count: number }[];
}

export function TopSenders({ senders }: TopSendersProps) {
  const max = senders[0]?.count ?? 1;

  if (senders.length === 0) {
    return (
      <p className="text-xs text-gray-400 py-4 text-center">No data yet</p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {senders.map((s, i) => (
        <div key={s.senderId} className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400 w-4 tabular-nums">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {s.senderId}
            </p>
            <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full"
                style={{ width: `${(s.count / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-red-600 tabular-nums flex-shrink-0">
            {s.count}
          </span>
        </div>
      ))}
    </div>
  );
}