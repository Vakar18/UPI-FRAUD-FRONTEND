// src/lib/api.ts
import axios from "axios";
import type {
  Transaction,
  DashboardStats,
  PaginatedResponse,
  ApiResponse,
  TransactionQuery,
  UploadResponse,
} from "@/types";

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── Transactions ──────────────────────────────────────────────────────────────

export async function getStats(): Promise<DashboardStats> {
  const res = await api.get<ApiResponse<DashboardStats>>("/transactions/stats");
  return res.data.data;
}

export async function getTransactions(
  query: TransactionQuery = {}
): Promise<PaginatedResponse<Transaction>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });
  const res = await api.get<PaginatedResponse<Transaction>>(
    `/transactions?${params.toString()}`
  );
  return res.data;
}

export async function getTransaction(txnId: string): Promise<Transaction> {
  const res = await api.get<ApiResponse<Transaction>>(
    `/transactions/${txnId}`
  );
  return res.data.data;
}

export async function clearTransaction(txnId: string): Promise<Transaction> {
  const res = await api.patch<ApiResponse<Transaction>>(
    `/transactions/${txnId}/clear`
  );
  return res.data.data;
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadCsv(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post<UploadResponse>("/upload/csv", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getFraudSignals(): Promise<{ label: string; pct: number }[]> {
  const res = await api.get<ApiResponse<{ label: string; pct: number }[]>>("/transactions/fraud-signals");
  return res.data.data;
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function getHealth() {
  const res = await api.get("/health");
  return res.data;
}

export default api;