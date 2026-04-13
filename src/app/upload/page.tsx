"use client";
// src/app/upload/page.tsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { uploadCsv } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { UploadResponse } from "@/types";

type Phase = "idle" | "uploading" | "done" | "error";

export default function UploadPage() {
  const [phase,    setPhase]    = useState<Phase>("idle");
  const [result,   setResult]   = useState<UploadResponse | null>(null);
  const [errMsg,   setErrMsg]   = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setPhase("uploading");
    setResult(null);
    setErrMsg(null);

    try {
      const res = await uploadCsv(file);
      setResult(res);
      setPhase("done");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Upload failed";
      setErrMsg(msg);
      setPhase("error");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:   { "text/csv": [".csv"], "text/plain": [".csv"] },
    maxFiles: 1,
    maxSize:  10 * 1024 * 1024,
    onDropAccepted: ([file]) => handleFile(file),
    onDropRejected: ([rej]) => {
      const e = rej.errors[0];
      setErrMsg(
        e.code === "file-too-large"
          ? "File exceeds 10 MB limit"
          : e.message
      );
      setPhase("error");
    },
  });

  function reset() {
    setPhase("idle");
    setResult(null);
    setErrMsg(null);
    setFileName(null);
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* Instructions */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-800 mb-2">
          Bulk upload UPI transactions
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Upload a CSV file (max 10 MB). Each row is validated, saved to
          MongoDB and enqueued for ML risk scoring automatically.
        </p>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Required columns:
          </p>
          <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
            txnId, senderId, receiverId, amount, deviceId, city, state,
            transactionTime
          </p>
          <p className="text-xs font-medium text-gray-600 mt-2 mb-1">
            Optional columns:
          </p>
          <p className="text-[11px] font-mono text-gray-500">
            currency, ipAddress, deviceModel
          </p>
        </div>
      </div>

      {/* Drop zone */}
      {(phase === "idle" || phase === "error") && (
        <div
          {...getRootProps()}
          className={cn(
            "card border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-12 gap-3",
            isDragActive
              ? "border-brand bg-indigo-50"
              : "border-gray-200 hover:border-brand hover:bg-gray-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Upload size={20} className="text-brand" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? "Drop the file here" : "Drag & drop your CSV"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              or click to browse · max 10 MB
            </p>
          </div>
        </div>
      )}

      {/* Uploading state */}
      {phase === "uploading" && (
        <div className="card flex flex-col items-center py-10 gap-3">
          <Loader2 size={28} className="text-brand animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Uploading…</p>
            <p className="text-xs text-gray-400 mt-1">{fileName}</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {phase === "error" && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">Upload failed</p>
              <p className="text-xs text-red-600 mt-1">{errMsg}</p>
            </div>
          </div>
          <button onClick={reset} className="btn-ghost mt-3 text-xs">
            Try again
          </button>
        </div>
      )}

      {/* Success result */}
      {phase === "done" && result && (
        <div className="flex flex-col gap-3">
          <div className="card border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-green-600" />
              <p className="text-sm font-semibold text-green-700">
                Upload complete
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total rows",    value: result.totalRows, color: "text-gray-800" },
                { label: "Accepted",      value: result.accepted,  color: "text-green-700" },
                { label: "Rejected",      value: result.rejected,  color: "text-red-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-lg p-3 text-center border border-green-100">
                  <p className={cn("text-xl font-bold tabular-nums", s.color)}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-600 mt-3">
              {result.accepted} transactions queued for ML risk scoring.
              Job ID: <span className="font-mono">{result.jobId}</span>
            </p>
          </div>

          {result.errors.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-amber-500" />
                <p className="text-xs font-semibold text-gray-700">
                  {result.errors.length} row error{result.errors.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-[11px] text-gray-500 font-mono">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={reset} className="btn-primary text-xs">
              Upload another file
            </button>
            <a href="/transactions" className="btn-ghost text-xs">
              View transactions →
            </a>
          </div>
        </div>
      )}

      {/* Sample CSV hint */}
      <div className="card bg-gray-50 border-gray-200">
        <div className="flex items-start gap-2.5">
          <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-600">Sample CSV row</p>
            <p className="text-[10px] font-mono text-gray-400 mt-1.5 leading-relaxed break-all">
              UPI20240409001,user123@oksbi,merchant@hdfc,250000,INR,DV-ABC123,Mumbai,Maharashtra,103.21.58.12,Samsung Galaxy S23,2024-04-09T14:30:00.000Z
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}