"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Ви впевнені, що хочете видалити цю квартиру?")) {
      const res = await fetch(`/api/admin/apartments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Помилка видалення");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Видалити"
    >
      <Trash2 size={18} />
    </button>
  );
}
