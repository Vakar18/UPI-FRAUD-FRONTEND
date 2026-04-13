"use client";
// src/app/settings/page.tsx
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { getHealth } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Wifi } from "lucide-react";

export default function SettingsPage() {
  const { isConnected } = useSocket();
  const [health, setHealth]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, []);

  const mongoOk = health?.details?.mongodb?.status === "up";

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="card">
        <p className="text-sm font-semibold text-gray-800 mb-4">
          Service health
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              label:  "NestJS API",
              ok:     !loading && health !== null,
              detail: "http://localhost:3000/api/v1",
            },
            {
              label:  "MongoDB",
              ok:     mongoOk,
              detail: "Primary database",
            },
            {
              label:  "WebSocket",
              ok:     isConnected,
              detail: "ws://localhost:3000/fraud",
            },
            {
              label:  "ML Service",
              ok:     !loading,
              detail: "http://localhost:5000",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
            >
              {s.ok ? (
                <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
              ) : (
                <XCircle size={15} className="text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">{s.label}</p>
                <p className="text-[11px] text-gray-400 font-mono">{s.detail}</p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  s.ok
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                )}
              >
                {s.ok ? "Online" : "Offline"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Configuration
        </p>
        <table className="w-full">
          <tbody>
            {[
              { key: "API base URL",    val: "/api/v1 (proxied)" },
              { key: "WebSocket URL",   val: "http://localhost:3000/fraud" },
              { key: "Fraud threshold", val: "Score ≥ 70 → HIGH" },
              { key: "Alert threshold", val: "Score ≥ 40 → MEDIUM" },
              { key: "Frontend port",   val: "3001" },
              { key: "Build",           val: "Next.js 14 · App Router" },
            ].map(({ key, val }) => (
              <tr key={key} className="border-b border-gray-50 last:border-0">
                <td className="py-2 text-xs text-gray-500">{key}</td>
                <td className="py-2 text-xs font-mono text-gray-700 text-right">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}