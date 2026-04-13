"use client";
// src/components/layout/Topbar.tsx
import { usePathname } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/":             "Overview · Dashboard",
  "/transactions": "Transactions",
  "/alerts":       "Live Alerts",
  "/analytics":    "Analytics",
  "/upload":       "Upload CSV",
  "/settings":     "Settings",
};

export function Topbar() {
  const path    = usePathname();
  const { isConnected, unreviewed } = useSocket();
  const title   = TITLES[path] ?? "PayGuard";

  return (
    <header className="h-12 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
      <h1 className="text-[13px] font-semibold text-gray-800 flex-1">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {unreviewed.length > 0 && (
          <span className="bg-red-50 text-red-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
            {unreviewed.length} unreviewed alert{unreviewed.length > 1 ? "s" : ""}
          </span>
        )}

        <div
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full",
            isConnected
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isConnected ? "bg-green-500 live-dot" : "bg-gray-400"
            )}
          />
          {isConnected ? "Live" : "Connecting…"}
        </div>
      </div>
    </header>
  );
}