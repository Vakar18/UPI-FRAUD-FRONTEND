"use client";
// src/hooks/useSocket.ts
// ─────────────────────────────────────────────────────────────────────────────
// Manages a single Socket.io connection to ws://localhost:3000/fraud.
// Returns typed event handlers, connection state, and alert persistence.
//
// Features:
//  • Persists alerts to localStorage
//  • Tracks reviewed alerts separately
//  • Keeps historical alerts even after dismissal
//
// Usage:
//   const { isConnected, alerts, reviewedAlerts, markAsReviewed } = useSocket();
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import type { FraudAlert, TxnScored, DashboardStats } from "@/types";

const WS_URL       = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";
const MAX_ALERTS   = 100;
const MAX_SCORED   = 100;
const STORAGE_KEY_ALERTS = "upi_fraud_alerts";
const STORAGE_KEY_REVIEWED = "upi_fraud_reviewed_alerts";

export interface SocketState {
  isConnected:     boolean;
  alerts:          FraudAlert[];
  reviewedAlerts:  Set<string>;
  unreviewed:      FraudAlert[];
  latestScored:    TxnScored[];
  stats:           DashboardStats | null;
  clearAlerts:     () => void;
  markAsReviewed:  (txnId: string) => void;
  clearReviewed:   () => void;
}

export function useSocket(): SocketState {
  const socketRef             = useRef<Socket | null>(null);
  const [isConnected, setIsConnected]   = useState(false);
  const [alerts,       setAlerts]       = useState<FraudAlert[]>([]);
  const [reviewedAlerts, setReviewedAlerts] = useState<Set<string>>(new Set());
  const [latestScored, setLatestScored] = useState<TxnScored[]>([]);
  const [stats,        setStats]        = useState<DashboardStats | null>(null);

  // Load persisted alerts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALERTS);
      const storedReviewed = localStorage.getItem(STORAGE_KEY_REVIEWED);
      
      if (stored) {
        const parsedAlerts = JSON.parse(stored) as FraudAlert[];
        setAlerts(parsedAlerts);
      }
      
      if (storedReviewed) {
        const reviewed = new Set(JSON.parse(storedReviewed) as string[]);
        setReviewedAlerts(reviewed);
      }
    } catch (err) {
      console.warn("Failed to load alerts from localStorage:", err);
    }
  }, []);

  // Persist alerts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch (err) {
      console.warn("Failed to save alerts to localStorage:", err);
    }
  }, [alerts]);

  // Persist reviewed alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWED, JSON.stringify(Array.from(reviewedAlerts)));
    } catch (err) {
      console.warn("Failed to save reviewed alerts to localStorage:", err);
    }
  }, [reviewedAlerts]);

  useEffect(() => {
    const socket = io(`${WS_URL}/fraud`, {
      transports: ["websocket", "polling"],
      reconnectionDelay:     1000,
      reconnectionAttempts:  10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("fraud-alert", (alert: FraudAlert) => {
      setAlerts((prev) => {
        // Avoid duplicates
        const filtered = prev.filter((a) => a.txnId !== alert.txnId);
        return [alert, ...filtered].slice(0, MAX_ALERTS);
      });
    });

    socket.on("txn-scored", (txn: TxnScored) => {
      setLatestScored((prev) => [txn, ...prev].slice(0, MAX_SCORED));
    });

    socket.on("stats-update", (s: DashboardStats) => {
      setStats(s);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    localStorage.removeItem(STORAGE_KEY_ALERTS);
  }, []);

  const markAsReviewed = useCallback((txnId: string) => {
    setReviewedAlerts((prev) => {
      if (prev.has(txnId)) {
        return prev; // Already marked, no change needed
      }
      const updated = new Set(prev);
      updated.add(txnId);
      return updated;
    });
  }, []);

  const clearReviewed = useCallback(() => {
    setReviewedAlerts(new Set());
    localStorage.removeItem(STORAGE_KEY_REVIEWED);
  }, []);

  // Memoize unreviewed calculation to ensure consistent reference and proper updates
  const unreviewed = useMemo(
    () => alerts.filter((a) => !reviewedAlerts.has(a.txnId)),
    [alerts, reviewedAlerts]
  );

  return {
    isConnected,
    alerts,
    reviewedAlerts,
    unreviewed,
    latestScored,
    stats,
    clearAlerts,
    markAsReviewed,
    clearReviewed,
  };
}