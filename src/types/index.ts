// src/types/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types. Mirror the NestJS backend schemas so payloads
// are always type-safe end-to-end.
// ─────────────────────────────────────────────────────────────────────────────

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SCORED"
  | "FLAGGED"
  | "CLEARED"
  | "FAILED";

export interface Transaction {
  _id: string;
  txnId: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  deviceId: string;
  city: string;
  state: string;
  ipAddress?: string;
  deviceModel?: string;
  riskLevel?: RiskLevel;
  riskScore?: number;
  fraudSignals?: Record<string, boolean | number>;
  riskReason?: string;
  status: TransactionStatus;
  scoredAt?: string;
  transactionTime: string;
  recentTxnCount: number;
  isNewRecipient: boolean;
  hourOfDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  riskDistribution: Record<RiskLevel, number>;
  hourlyVolume: { hour: number; count: number; flagged: number }[];
  totalAmountFlagged: number;
  topFlaggedSenders: { senderId: string; count: number }[];
  generatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FraudAlert {
  txnId: string;
  senderId: string;
  receiverId: string;
  amount: number;
  city: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReason: string;
  fraudSignals: Record<string, boolean | number>;
  scoredAt: string;
}

export interface TxnScored {
  txnId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  scoredAt: string;
}

export interface TransactionQuery {
  riskLevel?: RiskLevel;
  status?: TransactionStatus;
  senderId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UploadResponse {
  jobId: string;
  totalRows: number;
  accepted: number;
  rejected: number;
  errors: string[];
  status: string;
  startedAt: string;
}