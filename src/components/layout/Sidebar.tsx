"use client";
// src/components/layout/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BellRing,
  BarChart3,
  Upload,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/alerts",       label: "Alerts",       icon: BellRing },
  { href: "/analytics",    label: "Analytics",    icon: BarChart3 },
  { href: "/upload",       label: "Upload CSV",   icon: Upload },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-[200px] flex-shrink-0 bg-sidebar-bg flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sidebar-bright text-sm font-semibold leading-none">
              PayGuard
            </p>
            <p className="text-sidebar-sub text-[10px] mt-0.5">
              Fraud Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                active
                  ? "bg-sidebar-active text-sidebar-bright font-medium"
                  : "text-sidebar-text hover:bg-sidebar-active hover:text-sidebar-bright"
              )}
            >
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-sidebar-sub text-[10px]">v2.0 · Part 5</p>
        <p className="text-sidebar-sub text-[10px] mt-0.5">
          NestJS + Next.js
        </p>
      </div>
    </aside>
  );
}