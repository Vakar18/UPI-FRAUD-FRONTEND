// src/components/ui/StatCard.tsx
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label:      string;
  value:      string | number;
  sub?:       string;
  subColor?:  string;
  icon:       LucideIcon;
  iconBg:     string;
  iconColor:  string;
  trend?:     string;
  trendUp?:   boolean;
}

export function StatCard({
  label,
  value,
  sub,
  subColor,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="stat-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}
        >
          <Icon size={16} className={iconColor} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full",
              trendUp
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
        {sub && (
          <p className={cn("text-xs mt-0.5", subColor ?? "text-gray-400")}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}