// src/components/ui/ScoreBar.tsx
import { scoreColor } from "@/lib/utils";

export function ScoreBar({
  score,
  showLabel = true,
}: {
  score: number;
  showLabel?: boolean;
}) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-semibold w-7 text-right tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
      )}
    </div>
  );
}