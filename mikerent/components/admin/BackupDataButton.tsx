"use client";

import { useState } from "react";
import { Download, Loader2, Shield } from "lucide-react";

type Props = {
  variant?: "primary" | "outline";
  className?: string;
  /** Резервна копія лише для власника */
  allowed?: boolean;
};

export function BackupDataButton({
  variant = "outline",
  className = "",
  allowed = true,
}: Props) {
  if (!allowed) return null;
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backup", { cache: "no-store" });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        alert(err.error || "Помилка завантаження копії");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] || `mikerent-backup-${new Date().toISOString().slice(0, 10)}.json`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Помилка мережі при завантаженні копії");
    } finally {
      setLoading(false);
    }
  };

  const base =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100";

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${base} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : variant === "primary" ? (
        <Download className="h-4 w-4" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
      {loading ? "Готую копію…" : "Завантажити резервну копію"}
    </button>
  );
}
