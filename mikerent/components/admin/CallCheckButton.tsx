"use client";

import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";
import { useState } from "react";

export default function CallCheckButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkCalled = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/apartments/${id}/call-check`, {
        method: "POST",
      });

      if (!res.ok) {
        alert("Не вдалося оновити позначку прозвону");
        return;
      }

      router.refresh();
    } catch {
      alert("Помилка мережі при оновленні позначки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkCalled}
      disabled={loading}
      className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
      title="Позначити як прозвонено"
    >
      <span className="inline-flex items-center gap-1">
        <PhoneCall size={12} />
        {loading ? "..." : "Прозвонено"}
      </span>
    </button>
  );
}
