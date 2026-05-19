"use client";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({
  id,
  canCancel = true,
}: {
  id: string;
  canCancel?: boolean;
}) {
  const router = useRouter();

  if (!canCancel) return null;

  const handleCancel = async () => {
    if (
      !confirm(
        "Скасувати бронювання? Запис залишиться в історії — його можна буде відновити.",
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Помилка скасування");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
      title="Скасувати (залишити в історії)"
    >
      <Ban size={18} />
    </button>
  );
}
