"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  inquiryId: string;
  calledAt: string | null;
};

export default function HousingInquiryActions({
  inquiryId,
  calledAt,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<
    null | "called" | "complete" | "reject"
  >(null);

  const runAction = async (
    action: "called" | "complete" | "reject",
    endpoint: string,
  ) => {
    setLoading(action);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Помилка обробки запиту");
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
            `/api/admin/housing-inquiries/${inquiryId}/called`,
          )
        }
        className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
      >
        {loading === "called" ? "..." : calledAt ? "Прозвонено" : "Прозвонити"}
      </button>

      <button
        disabled={loading !== null}
        onClick={() =>
          runAction(
            "complete",
            `/api/admin/housing-inquiries/${inquiryId}/complete`,
          )
        }
        className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
      >
        {loading === "complete" ? "..." : "Оброблено"}
      </button>

      <button
        disabled={loading !== null}
        onClick={() =>
          runAction(
            "reject",
            `/api/admin/housing-inquiries/${inquiryId}/reject`,
          )
        }
        className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        {loading === "reject" ? "..." : "Відхилити"}
      </button>
    </div>
  );
}
