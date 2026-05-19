"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy } from "lucide-react";

export default function DuplicateApartmentButton({
  apartmentId,
  title,
}: {
  apartmentId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const duplicate = async () => {
    if (
      !confirm(
        `Скопіювати «${title}» на наступний сезон? Броні не копіюються.`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/apartments/${apartmentId}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) {
        alert("Помилка копіювання");
        return;
      }
      const apt = await res.json();
      router.push(`/admin/apartments/edit/${apt.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={duplicate}
      disabled={loading}
      title="Копія на наступний сезон"
      className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      <Copy size={14} />
      {loading ? "…" : "Сезон+"}
    </button>
  );
}
