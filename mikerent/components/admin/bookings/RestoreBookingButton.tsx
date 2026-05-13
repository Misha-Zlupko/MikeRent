"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RestoreBookingButton({ id }: { id: string }) {
  const router = useRouter();

  const handleRestore = async () => {
    if (!confirm("Відновити бронювання як підтверджене?")) {
      return;
    }
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Не вдалося відновити (можливо, дати вже зайняті)");
    }
  };

  return (
    <button
      type="button"
      onClick={handleRestore}
      className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
      title="Відновити бронювання"
    >
      <RotateCcw size={18} />
    </button>
  );
}
