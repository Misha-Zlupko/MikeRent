"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requestId: string;
  calledAt: string | null;
};

export default function RequestActions({ requestId, calledAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<null | "called" | "confirm" | "reject">(
    null,
  );

  const runAction = async (
    action: "called" | "confirm" | "reject",
    endpoint: string,
  ) => {
    setLoading(action);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Помилка обробки заявки");
        return;
      }
      router.refresh();
    } catch {
      alert("Помилка мережі");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={Boolean(calledAt) || loading !== null}
        onClick={() =>
          runAction(
            "called",
            `/api/admin/booking-requests/${requestId}/called`,
          )
        }
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
      >
        {loading === "called" ? "..." : calledAt ? "Прозвонено" : "Прозвонити"}
      </button>

      <button
        disabled={loading !== null}
        onClick={() =>
          runAction(
            "confirm",
            `/api/admin/booking-requests/${requestId}/confirm`,
          )
        }
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
      >
        {loading === "confirm" ? "..." : "Підтвердити"}
      </button>

      <button
        disabled={loading !== null}
        onClick={() =>
          runAction("reject", `/api/admin/booking-requests/${requestId}/reject`)
        }
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        {loading === "reject" ? "..." : "Відхилити"}
      </button>
    </div>
  );
}
